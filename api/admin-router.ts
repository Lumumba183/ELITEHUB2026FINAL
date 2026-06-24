import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  users,
  transactions,
  withdrawalRequests,
  dmViolations,
  adCampaigns,
  signupTargets,
  subscriptions,
} from "@db/schema";

export const adminRouter = createRouter({
  // ─── KPIs ──────────────────────────────────────────────────────────
  getKPIs: adminQuery
    .input(z.object({
      period: z.enum(["24h", "7d", "30d"]).default("30d"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const period = input?.period ?? "30d";

      const days = period === "24h" ? 1 : period === "7d" ? 7 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Total users
      const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalUsers = totalUsersResult[0]?.count ?? 0;

      // New users in period
      const newUsersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= ${since}`);
      const newUsers = newUsersResult[0]?.count ?? 0;

      // Active subscriptions
      const activeSubsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active"));
      const activeSubscriptions = activeSubsResult[0]?.count ?? 0;

      // Monthly revenue
      const revenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(gross_amount), 0)` })
        .from(transactions)
        .where(and(
          sql`${transactions.createdAt} >= ${since}`,
          eq(transactions.status, "completed")
        ));
      const monthlyRevenue = Number(revenueResult[0]?.total ?? 0);

      // Pending withdrawals
      const pendingWithdrawalsResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, "pending"));
      const pendingWithdrawals = Number(pendingWithdrawalsResult[0]?.total ?? 0);

      // DM violations (24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const violationsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(dmViolations)
        .where(sql`${dmViolations.detectedAt} >= ${yesterday}`);
      const violations24h = violationsResult[0]?.count ?? 0;

      // Signup target progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetResult = await db
        .select()
        .from(signupTargets)
        .where(eq(signupTargets.period, "daily"))
        .orderBy(desc(signupTargets.setAt))
        .limit(1);

      const signupTarget = targetResult[0] ?? { targetCount: 100, currentCount: newUsers };

      return {
        totalUsers,
        newUsers,
        activeSubscriptions,
        monthlyRevenue,
        pendingWithdrawals,
        violations24h,
        signupTarget: {
          target: signupTarget?.targetCount ?? 100,
          current: signupTarget?.currentCount ?? newUsers,
          percentage: Math.round(((signupTarget?.currentCount ?? newUsers) / (signupTarget?.targetCount ?? 100)) * 100),
        },
      };
    }),

  // ─── Revenue Chart ─────────────────────────────────────────────────
  getRevenueChart: adminQuery
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;

      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Revenue for this day
        const revenueResult = await db
          .select({ total: sql<number>`COALESCE(SUM(gross_amount), 0)` })
          .from(transactions)
          .where(and(
            sql`${transactions.createdAt} >= ${date}`,
            sql`${transactions.createdAt} < ${nextDate}`,
            eq(transactions.status, "completed")
          ));

        // New users for this day
        const usersResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(
            sql`${users.createdAt} >= ${date}`,
            sql`${users.createdAt} < ${nextDate}`
          ));

        data.push({
          date: date.toISOString().split("T")[0],
          revenue: Number(revenueResult[0]?.total ?? 0),
          newUsers: usersResult[0]?.count ?? 0,
        });
      }

      return data;
    }),

  // ─── Recent Signups ────────────────────────────────────────────────
  getRecentSignups: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      const items = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        limit,
      });

      return items;
    }),

  // ─── Campaign Performance ──────────────────────────────────────────
  getCampaigns: adminQuery
    .input(z.object({
      platform: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();

      const where = input?.platform
        ? eq(adCampaigns.platform, input.platform)
        : undefined;

      const items = await db.query.adCampaigns.findMany({
        where,
        orderBy: [desc(adCampaigns.date)],
      });

      return items;
    }),

  // Toggle campaign status
  updateCampaignStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "paused", "ended"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(adCampaigns)
        .set({ status: input.status })
        .where(eq(adCampaigns.id, input.id));
      return { success: true };
    }),

  // ─── Violations ────────────────────────────────────────────────────
  getViolations: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      const items = await db.query.dmViolations.findMany({
        orderBy: [desc(dmViolations.detectedAt)],
        limit,
      });

      // Enrich with names
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
        enriched.push({
          ...v,
          senderName: sender?.name ?? "Unknown",
          receiverName: receiver?.name ?? "Unknown",
        });
      }

      return enriched;
    }),

  // ─── Morning Report ────────────────────────────────────────────────
  getMorningReport: adminQuery.query(async () => {
    const db = getDb();

    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Yesterday's stats
    const yesterdaySignups = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${yesterday}`);

    const yesterdayRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(gross_amount), 0)` })
      .from(transactions)
      .where(sql`${transactions.createdAt} >= ${yesterday}`);

    const yesterdayViolations = await db
      .select({ count: sql<number>`count(*)` })
      .from(dmViolations)
      .where(sql`${dmViolations.detectedAt} >= ${yesterday}`);

    const pendingWithdrawals = await db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`COALESCE(SUM(amount), 0)`,
      })
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.status, "pending"));

    // Top campaigns
    const topCampaigns = await db.query.adCampaigns.findMany({
      where: eq(adCampaigns.status, "active"),
      orderBy: [desc(adCampaigns.spend)],
      limit: 5,
    });

    return {
      date: now.toISOString().split("T")[0],
      dailyStats: {
        newSignups: yesterdaySignups[0]?.count ?? 0,
        revenue: Number(yesterdayRevenue[0]?.total ?? 0),
        violations: yesterdayViolations[0]?.count ?? 0,
      },
      pendingWithdrawals: {
        count: pendingWithdrawals[0]?.count ?? 0,
        total: Number(pendingWithdrawals[0]?.total ?? 0),
      },
      topCampaigns,
    };
  }),

  // ─── Signup Targets ────────────────────────────────────────────────
  getSignupTargets: adminQuery.query(async () => {
    const db = getDb();
    const targets = await db.query.signupTargets.findMany({
      orderBy: [desc(signupTargets.setAt)],
      limit: 10,
    });
    return targets;
  }),

  setSignupTarget: adminQuery
    .input(z.object({
      period: z.enum(["daily", "weekly"]),
      targetCount: z.number().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(signupTargets).values({
        period: input.period,
        targetCount: input.targetCount,
        currentCount: 0,
      });
      return { success: true };
    }),
});
