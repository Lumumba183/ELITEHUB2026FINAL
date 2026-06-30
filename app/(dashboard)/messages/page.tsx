"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Conversation {
  id: string;
  client_id: string;
  companion_id: string;
  last_message_at: string | null;
  created_at: string;
  client: { display_name: string; avatar_url: string | null } | null;
  companion: { display_name: string; avatar_url: string | null } | null;
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("conversation");
  const newCompanionId = searchParams.get("new");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, dbUser } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user && dbUser) {
      fetchConversations();
    }
  }, [user, dbUser]);

  useEffect(() => {
    if (selectedId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === selectedId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conv.id);
      }
    }
  }, [selectedId, conversations]);

  useEffect(() => {
    if (newCompanionId && dbUser) {
      startNewConversation(newCompanionId);
    }
  }, [newCompanionId, dbUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    const { data } = await supabase
      .from("conversations")
      .select(
        `id, client_id, companion_id, last_message_at, created_at,
        client:client_id(display_name, avatar_url),
        companion:companion_id(display_name, avatar_url),
        last_message:messages!conversations_last_message_id_fkey(content, created_at, sender_id)
      `
      )
      .or(`client_id.eq.${dbUser?.id},companion_id.eq.${dbUser?.id}`)
      .order("last_message_at", { ascending: false });

    setConversations(data || []);
    setLoading(false);
  }

  async function fetchMessages(conversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", dbUser?.id)
      .eq("is_read", false);
  }

  async function startNewConversation(companionId: string) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`client_id.eq.${dbUser?.id},companion_id.eq.${dbUser?.id}`)
      .or(`client_id.eq.${companionId},companion_id.eq.${companionId}`)
      .single();

    if (existing) {
      setSelectedConversation(existing as any);
      fetchMessages(existing.id);
      return;
    }

    const { data } = await supabase
      .from("conversations")
      .insert({
        client_id: dbUser?.role === "client" ? dbUser?.id : companionId,
        companion_id: dbUser?.role === "companion" ? dbUser?.id : companionId,
      })
      .select()
      .single();

    if (data) {
      fetchConversations();
      setSelectedConversation(data as any);
    }
  }

  async function sendMessage() {
    if (!messageInput.trim() || !selectedConversation || !dbUser) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender_id: dbUser.id,
      content: messageInput.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setMessageInput("");
      fetchMessages(selectedConversation.id);
      fetchConversations();
    }

    setSending(false);
  }

  return (
    <div className="h-[calc(100vh-6rem)] glass rounded-2xl overflow-hidden flex">
      {/* Conversations List */}
      <div className="w-full lg:w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="font-display text-xl font-bold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A2E]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1A1A2E] rounded w-1/2" />
                    <div className="h-3 bg-[#1A1A2E] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const otherUser = conv.client_id === dbUser?.id ? conv.companion : conv.client;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    fetchMessages(conv.id);
                  }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-white/5" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#E11D48]/10 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-[#E11D48]">
                      {(otherUser?.display_name || "?")[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{otherUser?.display_name || "User"}</p>
                      {conv.last_message && (
                        <span className="text-xs text-[#A09B8C]">
                          {new Date(conv.last_message.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A09B8C] truncate">
                      {conv.last_message?.content || "Start a conversation..."}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-[#A09B8C]">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
                <span className="font-semibold text-[#E11D48]">
                  {((selectedConversation.client_id === dbUser?.id
                    ? selectedConversation.companion?.display_name
                    : selectedConversation.client?.display_name) || "?")[0]}
                </span>
              </div>
              <div>
                <p className="font-medium">
                  {selectedConversation.client_id === dbUser?.id
                    ? selectedConversation.companion?.display_name
                    : selectedConversation.client?.display_name}
                </p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg">
                <Phone className="w-5 h-5 text-[#A09B8C]" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg">
                <Video className="w-5 h-5 text-[#A09B8C]" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg">
                <MoreVertical className="w-5 h-5 text-[#A09B8C]" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => {
              const isMe = msg.sender_id === dbUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      isMe
                        ? "bg-[#E11D48] text-white rounded-br-md"
                        : "glass rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-white/70" : "text-[#A09B8C]"}`}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded-lg">
                <ImageIcon className="w-5 h-5 text-[#A09B8C]" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg">
                <Smile className="w-5 h-5 text-[#A09B8C]" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !messageInput.trim()}
                className="p-3 bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:bg-[#E11D48]/50 text-white rounded-xl transition-colors"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedConversation && (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-[#A09B8C]">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
