import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { Send, Gift, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const [activeConvo, setActiveConvo] = useState<number | null>(
    conversationId ? Number(conversationId) : null
  );
  const [messageText, setMessageText] = useState("");
  const [blockedWarning, setBlockedWarning] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  const { data: conversations, isLoading: convosLoading } = trpc.message.getConversations.useQuery();
  const { data: messages } = trpc.message.getMessages.useQuery(
    { conversationId: activeConvo ?? 0, limit: 50 },
    { enabled: !!activeConvo }
  );

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: (result) => {
      if (result.blocked) {
        setBlockedWarning(true);
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
        setTimeout(() => setBlockedWarning(false), 5000);
      } else {
        setMessageText("");
        setBlockedWarning(false);
      }
      utils.message.getMessages.invalidate();
      utils.message.getConversations.invalidate();
    },
  });

  const markRead = trpc.message.markRead.useMutation({
    onSuccess: () => utils.message.getConversations.invalidate(),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConvo) {
      markRead.mutate({ conversationId: activeConvo });
    }
  }, [activeConvo]);

  const handleSend = () => {
    if (!messageText.trim() || !activeConvo) return;
    const convo = conversations?.find((c) => c.id === activeConvo);
    if (!convo?.otherUser?.id) return;
    sendMessage.mutate({
      receiverId: convo.otherUser.id,
      content: messageText.trim(),
    });
  };

  const activeConversation = conversations?.find((c) => c.id === activeConvo);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Conversation List */}
      <div
        className={`w-full lg:w-80 border-r border-white/5 flex flex-col ${
          activeConvo ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard" className="lg:hidden">
              <Button variant="ghost" size="sm" className="text-[#9CA3AF]">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-[#F5E6D3]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Messages
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convosLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#1E1E2D]" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-[#1E1E2D] rounded" />
                  <div className="w-32 h-3 bg-[#1E1E2D] rounded" />
                </div>
              </div>
            ))
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1E1E2D] flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[#9CA3AF] mb-2">No conversations yet</p>
              <p className="text-xs text-[#9CA3AF]/60">Start messaging companions from the browse page</p>
            </div>
          ) : (
            conversations?.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setActiveConvo(convo.id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-white/5 text-left transition-all hover:bg-white/5 ${
                  activeConvo === convo.id ? "bg-[#E11D48]/5 border-l-2 border-l-[#E11D48]" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={convo.otherUser?.avatar ?? "/assets/companion-avatar-1.jpg"}
                    alt={convo.otherUser?.name ?? "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0A0A0F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#F5E6D3] truncate">
                      {convo.otherUser?.name ?? "Unknown"}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-bold min-w-[18px] text-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${activeConvo ? "flex" : "hidden lg:flex"}`}>
        {activeConvo && activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <button onClick={() => setActiveConvo(null)} className="lg:hidden text-[#9CA3AF]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={activeConversation.otherUser?.avatar ?? "/assets/companion-avatar-1.jpg"}
                alt={activeConversation.otherUser?.name ?? "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F5E6D3]">
                  {activeConversation.otherUser?.name ?? "Unknown"}
                </p>
                <p className="text-[10px] text-[#10B981]">Online</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10 text-xs"
              >
                <Gift className="w-3 h-3 mr-1" /> Send Gift
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-[#9CA3AF] text-sm">No messages yet</p>
                  <p className="text-xs text-[#9CA3AF]/60">Send a message to start the conversation</p>
                </div>
              )}

              {messages?.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                        msg.isBlocked
                          ? "bg-[#EF4444]/10 border border-[#EF4444]/30"
                          : isMe
                          ? "gradient-crimson text-white"
                          : "bg-[#14141E] text-[#F5E6D3]"
                      }`}
                    >
                      {msg.isBlocked ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-[#EF4444]">Message Blocked</p>
                            <p className="text-xs text-[#9CA3AF]">
                              Sharing contact information outside EliteHub is not permitted.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-[#9CA3AF]"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Violation Warning Banner */}
            <div className={`violation-banner px-4 ${blockedWarning ? "visible" : ""}`}>
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3 flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                <p className="text-xs text-[#EF4444]">
                  Sharing contact information outside EliteHub is not permitted. Violations are logged.
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className={`flex items-center gap-2 ${shakeInput ? "input-shake" : ""}`}>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#14141E] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/30 h-11"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                  className="gradient-crimson text-white border-0 hover:opacity-90 h-11 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-[#1E1E2D] flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-2">Select a conversation</h3>
            <p className="text-sm text-[#9CA3AF] max-w-sm">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
