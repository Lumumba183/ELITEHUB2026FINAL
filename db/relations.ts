import { relations } from "drizzle-orm";
import {
  users,
  conversations,
  messages,
  transactions,
  gifts,
  referrals,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  sentGifts: many(gifts, { relationName: "sentGifts" }),
  receivedGifts: many(gifts, { relationName: "receivedGifts" }),
  sentTransactions: many(transactions, { relationName: "sentTransactions" }),
  receivedTransactions: many(transactions, { relationName: "receivedTransactions" }),
  referralsMade: many(referrals, { relationName: "referralsMade" }),
  referralsReceived: many(referrals, { relationName: "referralsReceived" }),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fromUserData: one(users, {
    fields: [transactions.fromUser],
    references: [users.id],
    relationName: "sentTransactions",
  }),
  toUserData: one(users, {
    fields: [transactions.toUser],
    references: [users.id],
    relationName: "receivedTransactions",
  }),
}));

export const giftsRelations = relations(gifts, ({ one }) => ({
  sender: one(users, {
    fields: [gifts.fromClient],
    references: [users.id],
    relationName: "sentGifts",
  }),
  receiver: one(users, {
    fields: [gifts.toCompanion],
    references: [users.id],
    relationName: "receivedGifts",
  }),
}));
