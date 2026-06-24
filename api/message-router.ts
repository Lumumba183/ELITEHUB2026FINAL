import { z } from "zod";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, conversations, users, dmViolations } from "@db/schema";

// ─── Contact Detection Patterns ──────────────────────────────────────
const CONTACT_PATTERNS = [
  { pattern: /(\+?[0-9]{10,15})/g, type: "phone" },
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g, type: "email" },
  { pattern: /(wa\.me|whatsapp\.com)/gi, type: "social_link" },
  { pattern: /(t\.me|telegram\.me)/gi, type: "social_link" },
  { pattern: /(instagram\.com|ig:|insta:)/gi, type: "social_link" },
  { pattern: /(snapchat|snap:|sc:)/gi, type: "social_link" },
  { pattern: /(twitter\.com|x\.com)/gi, type: "social_link" },
  { pattern: /(onlyfans\.com)/gi, type: "external_platform" },
];

function scanForContactInfo(content: string): { blocked: boolean; reason?: string; violationType?: string } {
  for (const { pattern, type } of CONTACT_PATTERNS) {
    if (pattern.test(content)) {
      return {
        blocked: true,
        reason: "contact_info_detected",
        violationType: type,
      };
    }
  }
  return { blocked: false };
}

// ─── Router ──────────────────────────────────────────────────────────
export const messageRouter = createRouter({
  // Get all conversations for current user
  getConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const convos = await db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ),
      orderBy: [desc(conversations.lastMessageAt)],
    });

    // Get the other user's info for each conversation
    const result = [];
    for (const convo of convos) {
      const otherUserId = convo.user1Id === userId ? convo.user2Id : convo.user1Id;
      const otherUser = await db.query.users.findFirst({
        where: eq(users.id, otherUserId),
        columns: { id: true, name: true, avatar: true, role: true },
      });
      const unreadCount = convo.user1Id === userId ? convo.unreadCountUser1 : convo.unreadCountUser2;

      // Get last message
      const lastMsg = await db.query.messages.findFirst({
        where: eq(messages.conversationId, convo.id),
        orderBy: [desc(messages.createdAt)],
      });

      result.push({
        ...convo,
        otherUser,
        unreadCount,
        lastMessage: lastMsg?.content ?? "",
        lastMessageAt: lastMsg?.createdAt ?? convo.createdAt,
      });
    }

    return result;
  }),

  // Get messages in a conversation
  getMessages: authedQuery
    .input(z.object({
      conversationId: z.number(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Verify user is part of this conversation
      const convo = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, input.conversationId),
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        ),
      });

      if (!convo) return [];

      const msgs = await db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });

      return msgs.reverse();
    }),

  // Send a message (with contact detection)
  send: authedQuery
    .input(z.object({
      receiverId: z.number(),
      content: z.string().min(1).max(5000),
      mediaUrl: z.string().url().optional(),
      mediaPrice: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const senderId = ctx.user.id;
      const { receiverId, content, mediaUrl, mediaPrice } = input;

      if (senderId === receiverId) {
        throw new Error("Cannot message yourself");
      }

      // Scan for contact info
      const scan = scanForContactInfo(content);

      // Find or create conversation
      let convo = await db.query.conversations.findFirst({
        where: or(
          and(eq(conversations.user1Id, senderId), eq(conversations.user2Id, receiverId)),
          and(eq(conversations.user1Id, receiverId), eq(conversations.user2Id, senderId))
        ),
      });

      if (!convo) {
        const result = await db.insert(conversations).values({
          user1Id: senderId,
          user2Id: receiverId,
          lastMessageAt: new Date(),
        });
        const newId = Number(result[0].insertId);
        convo = { id: newId, user1Id: senderId, user2Id: receiverId, lastMessageAt: new Date(), unreadCountUser1: 0, unreadCountUser2: 0, createdAt: new Date() };
      }

      // Insert message
      const messageValues: any = {
        senderId,
        receiverId,
        conversationId: convo.id,
        content,
        isBlocked: scan.blocked,
        blockReason: scan.blocked ? scan.reason : null,
      };

      if (mediaUrl) messageValues.mediaUrl = mediaUrl;
      if (mediaPrice) messageValues.mediaPrice = String(mediaPrice);

      const result = await db.insert(messages).values(messageValues);
      const messageId = Number(result[0].insertId);

      // Update conversation
      const isUser1Sender = convo.user1Id === senderId;
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          [isUser1Sender ? "unreadCountUser2" : "unreadCountUser1"]: sql`${conversations[isUser1Sender ? "unreadCountUser2" : "unreadCountUser1"]} + 1`,
        })
        .where(eq(conversations.id, convo.id));

      // If blocked, log violation
      if (scan.blocked) {
        await db.insert(dmViolations).values({
          senderId,
          receiverId,
          attemptedContent: content.substring(0, 200),
          violationType: scan.violationType!,
        });
      }

      return {
        id: messageId,
        blocked: scan.blocked,
        reason: scan.reason,
        violationType: scan.violationType,
      };
    }),

  // Mark conversation as read
  markRead: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const convo = await db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });

      if (!convo) return { success: false };

      const isUser1 = convo.user1Id === userId;
      await db.update(conversations)
        .set({
          [isUser1 ? "unreadCountUser1" : "unreadCountUser2"]: 0,
        })
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
    }),

  // Get DM violations (admin only)
  getViolations: adminQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit } = { page: 1, limit: 20, ...input };

      const items = await db.query.dmViolations.findMany({
        orderBy: [desc(dmViolations.detectedAt)],
        limit,
        offset: (page - 1) * limit,
      });

      // Get sender/receiver names
      const enriched = [];
      for (const v of items) {
        const sender = await db.query.users.findFirst({
          where: eq(users.id, v.senderId),
          columns: { name: true },
        });
        const receiver = await db.query.users.findFirst({
          where: eq(users.id, v.receiverId),
          columns: { name: true },
        });
        enriched.push({ ...v, senderName: sender?.name, receiverName: receiver?.name });
      }

      return enriched;
    }),
});
