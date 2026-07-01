"use client";

import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  coin_cost: number;
  category: "standard" | "premium" | "luxury";
}

interface GiftPickerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  onGiftSent: () => void;
  userCoins: number;
}

export default function GiftPicker({
  isOpen,
  onClose,
  conversationId,
  onGiftSent,
  userCoins,
}: GiftPickerProps) {
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [personalMessage, setPersonalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchGiftItems();
    }
  }, [isOpen]);

  async function fetchGiftItems() {
    setFetching(true);
    try {
      const res = await fetch("/api/gifts/items");
      const data = await res.json();
      if (res.ok) {
        setGiftItems(data.giftItems || []);
      } else {
        toast.error("Failed to load gift items");
      }
    } catch (err) {
      toast.error("Error loading gifts");
    } finally {
      setFetching(false);
    }
  }

  async function sendGift() {
    if (!selectedGift) return;

    if (userCoins < selectedGift.coin_cost) {
      toast.error(`Not enough coins! You need ${selectedGift.coin_cost} coins.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gifts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          gift_item_id: selectedGift.id,
          personal_message: personalMessage.trim() || `Sent a ${selectedGift.name} ${selectedGift.icon}!`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Gift sent! 🎉`);
        onGiftSent();
        onClose();
        setSelectedGift(null);
        setPersonalMessage("");
      } else {
        toast.error(data.error || "Failed to send gift");
      }
    } catch (err) {
      toast.error("Error sending gift");
    } finally {
      setLoading(false);
    }
  }

  const standardGifts = giftItems.filter((g) => g.category === "standard");
  const premiumGifts = giftItems.filter((g) => g.category === "premium");
  const luxuryGifts = giftItems.filter((g) => g.category === "luxury");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#E11D48]" />
                <h2 className="font-display font-bold text-lg">Send a Gift</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#A09B8C]" />
              </button>
            </div>

            {/* Coin Balance */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10">
              <p className="text-sm text-[#A09B8C]">
                Your Coins: <span className="font-bold text-[#F5E6D3]">{userCoins}</span> 💰
              </p>
            </div>

            {/* Gift Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {fetching ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {standardGifts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-[#A09B8C] uppercase tracking-wider mb-3">
                        Standard Gifts
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {standardGifts.map((gift) => (
                          <GiftCard
                            key={gift.id}
                            gift={gift}
                            selected={selectedGift?.id === gift.id}
                            onClick={() => setSelectedGift(gift)}
                            disabled={userCoins < gift.coin_cost}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {premiumGifts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-[#A09B8C] uppercase tracking-wider mb-3">
                        Premium Gifts
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {premiumGifts.map((gift) => (
                          <GiftCard
                            key={gift.id}
                            gift={gift}
                            selected={selectedGift?.id === gift.id}
                            onClick={() => setSelectedGift(gift)}
                            disabled={userCoins < gift.coin_cost}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {luxuryGifts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-[#A09B8C] uppercase tracking-wider mb-3">
                        Luxury Gifts
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {luxuryGifts.map((gift) => (
                          <GiftCard
                            key={gift.id}
                            gift={gift}
                            selected={selectedGift?.id === gift.id}
                            onClick={() => setSelectedGift(gift)}
                            disabled={userCoins < gift.coin_cost}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Selected Gift Details */}
            {selectedGift && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedGift.icon}</span>
                  <div>
                    <p className="font-medium">{selectedGift.name}</p>
                    <p className="text-sm text-[#A09B8C]">
                      {selectedGift.coin_cost} coins
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal message (optional)..."
                  maxLength={200}
                  className="w-full px-3 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-sm text-[#F5E6D3] placeholder:text-[#A09B8C]/50 focus:outline-none focus:border-[#E11D48]/50 mb-3"
                />
                <button
                  onClick={sendGift}
                  disabled={loading}
                  className="w-full py-3 bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:bg-[#E11D48]/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      Send {selectedGift.name} — {selectedGift.coin_cost} coins
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GiftCard({
  gift,
  selected,
  onClick,
  disabled,
}: {
  gift: GiftItem;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl border text-center transition-all ${
        selected
          ? "border-[#E11D48] bg-[#E11D48]/10 ring-1 ring-[#E11D48]"
          : disabled
          ? "border-white/5 opacity-50 cursor-not-allowed"
          : "border-white/10 hover:border-white/30 hover:bg-white/5"
      }`}
    >
      <span className="text-2xl block mb-1">{gift.icon}</span>
      <p className="text-xs font-medium truncate">{gift.name}</p>
      <p className="text-xs text-[#A09B8C]">{gift.coin_cost} coins</p>
    </motion.button>
  );
}
