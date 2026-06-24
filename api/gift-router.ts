import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, companionQuery, clientQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { gifts, users, transactions } from "@db/schema";

export const giftRouter = createRouter({
  // Send a gift (client only)
  send: clientQuery
    .input(z.object({
      companionId: z.number(),
      amount: z.number().min(5).max(10000),
      message: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const clientId = ctx.user.id;
      const { companionId, amount, message } = input;

      // Verify companion exists
      const companion = await db.query.users.findFirst({
        where: eq(users.id, companionId),
        columns: { id: true, role: true, walletBalance: true },
      });

      if (!companion || companion.role !== "companion") {
        throw new Error("Invalid companion");
      }

      // Check client balance
      const client = await db.query.users.findFirst({
        where: eq(users.id, clientId),
        columns: { walletBalance: true },
      });

      const clientBalance = Number(client?.walletBalance ?? 0);
      if (clientBalance < amount) {
        throw new Error("Insufficient wallet balance. Please add funds.");
      }

      // Calculate 50/50 split
      const companionShare = amount * 0.5;
      const platformShare = amount * 0.5;

      // Deduct from client
      await db.update(users)
        .set({ walletBalance: sql`${users.walletBalance} - ${amount}` })
        .where(eq(users.id, clientId));

      // Credit companion
      await db.update(users)
        .set({ walletBalance: sql`${users.walletBalance} + ${companionShare}` })
        .where(eq(users.id, companionId));

      // Create gift record
      await db.insert(gifts).values({
        fromClient: clientId,
        toCompanion: companionId,
        amount: String(amount),
        companionShare: String(companionShare),
        platformShare: String(platformShare),
        message: message ?? null,
      });

      // Log transaction
      await db.insert(transactions).values({
        fromUser: clientId,
        toUser: companionId,
        type: "gift",
        grossAmount: String(amount),
        platformCut: String(platformShare),
        companionCut: String(companionShare),
        netPayout: String(companionShare),
        status: "completed",
      });

      return {
        success: true,
        message: "Gift sent successfully",
        amount,
        companionShare,
      };
    }),

  // Get gifts received (companion)
  getReceived: companionQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { page, limit } = { page: 1, limit: 20, ...input };

      const items = await db.query.gifts.findMany({
        where: eq(gifts.toCompanion, ctx.user.id),
        orderBy: [desc(gifts.createdAt)],
        limit,
        offset: (page - 1) * limit,
      });

      // Enrich with sender names
      const enriched = [];
      for (const g of items) {
        const sender = await db.query.users.findFirst({
          where: eq(users.id, g.fromClient),
          columns: { name: true, avatar: true },
        });
        enriched.push({ ...g, senderName: sender?.name, senderAvatar: sender?.avatar });
      }

      return enriched;
    }),

  // Get gifts sent (client)
  getSent: clientQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { page, limit } = { page: 1, limit: 20, ...input };

      const items = await db.query.gifts.findMany({
        where: eq(gifts.fromClient, ctx.user.id),
        orderBy: [desc(gifts.createdAt)],
        limit,
        offset: (page - 1) * limit,
      });

      // Enrich with receiver names
      const enriched = [];
      for (const g of items) {
        const receiver = await db.query.users.findFirst({
          where: eq(users.id, g.toCompanion),
          columns: { name: true, avatar: true },
        });
        enriched.push({ ...g, receiverName: receiver?.name, receiverAvatar: receiver?.avatar });
      }

      return enriched;
    }),
});
