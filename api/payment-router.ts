import { z } from "zod";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, companionQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, transactions, withdrawalRequests } from "@db/schema";

export const paymentRouter = createRouter({
  // Get wallet balance
  getBalance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: { walletBalance: true },
    });
    return { balance: Number(user?.walletBalance ?? 0) };
  }),

  // Get transaction history
  getTransactions: authedQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      type: z.enum(["subscription", "media_sale", "gift", "tip", "featured_fee", "withdrawal", "referral_bonus"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { page, limit, type } = { page: 1, limit: 20, ...input };

      const conditions = [
        or(eq(transactions.fromUser, userId), eq(transactions.toUser, userId)),
      ];
      if (type) conditions.push(eq(transactions.type, type));

      const items = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.createdAt)],
        limit,
        offset: (page - 1) * limit,
      });

      return items;
    }),

  // Initiate M-Pesa STK Push (mock)
  initiateMpesa: authedQuery
    .input(z.object({
      phoneNumber: z.string().min(10).max(15),
      amount: z.number().min(1),
      type: z.enum(["subscription", "wallet", "gift"]),
    }))
    .mutation(async ({ input }) => {
      const { phoneNumber, amount, type } = input;

      const mockReference = `MPESA_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      return {
        success: true,
        message: "STK push initiated. Please check your phone.",
        reference: mockReference,
        phoneNumber,
        amount,
        type,
      };
    }),

  // M-Pesa callback handler (public webhook)
  mpesaCallback: publicQuery
    .input(z.object({
      reference: z.string(),
      resultCode: z.number(),
      amount: z.number(),
      phoneNumber: z.string(),
      transactionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.resultCode !== 0) {
        return { success: false, message: "Payment failed" };
      }

      await db.insert(transactions).values({
        type: "subscription",
        grossAmount: String(input.amount),
        platformCut: String(input.amount),
        status: "completed",
        paymentGateway: "mpesa",
        reference: input.transactionId,
      });

      return { success: true, message: "Payment processed" };
    }),

  // Initiate PesaPal payment (mock)
  initiatePesapal: authedQuery
    .input(z.object({
      amount: z.number().min(1),
      currency: z.enum(["USD", "GBP", "EUR", "AUD"]),
      type: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { amount, currency, type } = input;

      const mockOrderRef = `PSP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      return {
        success: true,
        redirectUrl: `/payment/pesapal/confirm?ref=${mockOrderRef}`,
        reference: mockOrderRef,
        amount,
        currency,
        type,
      };
    }),

  // Confirm PesaPal payment (mock)
  confirmPesapal: authedQuery
    .input(z.object({
      reference: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { reference, amount } = input;

      await db.update(users)
        .set({ walletBalance: sql`${users.walletBalance} + ${amount}` })
        .where(eq(users.id, userId));

      await db.insert(transactions).values({
        toUser: userId,
        type: "subscription",
        grossAmount: String(amount),
        netPayout: String(amount),
        status: "completed",
        paymentGateway: "pesapal",
        reference,
      });

      return { success: true, message: "Payment confirmed and wallet credited" };
    }),

  // Request withdrawal (companion only)
  withdraw: companionQuery
    .input(z.object({
      amount: z.number().min(10),
      paymentMethod: z.enum(["mpesa", "bank_transfer"]),
      paymentDetails: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const companionId = ctx.user.id;
      const { amount, paymentMethod, paymentDetails } = input;

      const user = await db.query.users.findFirst({
        where: eq(users.id, companionId),
        columns: { walletBalance: true },
      });

      const balance = Number(user?.walletBalance ?? 0);
      if (balance < amount) {
        throw new Error("Insufficient balance");
      }

      const processingFee = amount * 0.05;
      const netAmount = amount - processingFee;

      await db.update(users)
        .set({ walletBalance: sql`${users.walletBalance} - ${amount}` })
        .where(eq(users.id, companionId));

      await db.insert(withdrawalRequests).values({
        companionId,
        amount: String(amount),
        processingFee: String(processingFee),
        netAmount: String(netAmount),
        paymentMethod,
        paymentDetails,
      });

      await db.insert(transactions).values({
        fromUser: companionId,
        type: "withdrawal",
        grossAmount: String(amount),
        processingFee: String(processingFee),
        netPayout: String(netAmount),
        status: "pending",
        paymentGateway: paymentMethod,
      });

      return {
        success: true,
        message: "Withdrawal request submitted",
        amount,
        processingFee,
        netAmount,
      };
    }),

  // Get withdrawal history (companion)
  getWithdrawals: companionQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { page, limit } = { page: 1, limit: 20, ...input };

      const items = await db.query.withdrawalRequests.findMany({
        where: eq(withdrawalRequests.companionId, ctx.user.id),
        orderBy: [desc(withdrawalRequests.requestedAt)],
        limit,
        offset: (page - 1) * limit,
      });

      return items;
    }),

  // Process withdrawal (admin)
  processWithdrawal: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["completed", "rejected"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.update(withdrawalRequests)
        .set({
          status: input.status,
          processedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, input.id));

      return { success: true, status: input.status };
    }),

  // Get all pending withdrawals (admin)
  getPendingWithdrawals: adminQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit } = { page: 1, limit: 20, ...input };

      const items = await db.query.withdrawalRequests.findMany({
        where: eq(withdrawalRequests.status, "pending"),
        orderBy: [desc(withdrawalRequests.requestedAt)],
        limit,
        offset: (page - 1) * limit,
      });

      const enriched = [];
      for (const w of items) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, w.companionId),
          columns: { name: true, email: true },
        });
        enriched.push({ ...w, companionName: user?.name, companionEmail: user?.email });
      }

      return enriched;
    }),
});
