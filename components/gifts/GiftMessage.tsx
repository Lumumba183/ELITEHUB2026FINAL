"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface GiftMessageProps {
  giftName: string;
  giftIcon: string;
  coinCost: number;
  personalMessage: string;
  isSender: boolean;
  createdAt: string;
  companionShare?: number;
  isAdmin?: boolean;
}

export default function GiftMessage({
  giftName,
  giftIcon,
  coinCost,
  personalMessage,
  isSender,
  createdAt,
  companionShare,
  isAdmin,
}: GiftMessageProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`max-w-[80%] rounded-2xl p-4 ${
        isSender
          ? "bg-[#E11D48]/10 border border-[#E11D48]/30"
          : "bg-[#F5E6D3]/10 border border-[#F5E6D3]/30"
      }`}
    >
      {/* Gift Badge */}
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-[#E11D48]" />
        <span className="text-xs font-medium text-[#E11D48]">
          {isSender ? "🎁 GIFT SENT" : "🎁 GIFT RECEIVED"}
        </span>
      </div>

      {/* Gift Content */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl"
        >
          {giftIcon}
        </motion.div>
        <div>
          <p className="font-bold text-[#F5E6D3]">{giftName}</p>
          <p className="text-sm text-[#A09B8C]">{coinCost} coins</p>
        </div>
      </div>

      {/* Personal Message */}
      {personalMessage && personalMessage !== "Sent a gift!" && (
        <div className="bg-white/5 rounded-lg p-2 mb-2">
          <p className="text-sm text-[#F5E6D3]/80 italic">"{personalMessage}"</p>
        </div>
      )}

      {/* Companion sees earnings, sender sees confirmation */}
      {!isSender && companionShare && (
        <div className="flex items-center gap-1 text-sm text-green-400">
          <span>✨</span>
          <span>+{companionShare} coins earned!</span>
        </div>
      )}
      {isSender && (
        <p className="text-sm text-[#A09B8C]">Gift sent! 🎉</p>
      )}

      {/* Admin sees split details */}
      {isAdmin && companionShare && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-[#A09B8C]">
          <p>Companion: {companionShare} | Platform: {coinCost - companionShare}</p>
        </div>
      )}

      <p className="text-xs text-[#A09B8C]/60 mt-2">{formatDate(createdAt)}</p>
    </motion.div>
  );
}
