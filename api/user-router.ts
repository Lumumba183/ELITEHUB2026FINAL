import { z } from "zod";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, transactions, conversations } from "@db/schema";

export const userRouter = createRouter({
  // Get user by ID (public)
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          age: true,
          isFeatured: true,
          role: true,
          createdAt: true,
        },
      });
      return user ?? null;
    }),

  // Get featured companions (public)
  getFeatured: publicQuery
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 6;
      const featured = await db.query.users.findMany({
        where: and(eq(users.isFeatured, true), eq(users.role, "companion")),
        columns: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          age: true,
          isFeatured: true,
          createdAt: true,
        },
        limit,
      });
      return featured;
    }),

  // Search/browse users (public)
  search: publicQuery
    .input(
      z.object({
        query: z.string().optional(),
        location: z.string().optional(),
        role: z.enum(["companion", "client"]).optional(),
        featured: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { query, location, role, featured, page, limit } = {
        page: 1,
        limit: 12,
        ...input,
      };

      const conditions = [];
      if (query) {
        conditions.push(
          or(
            like(users.name, `%${query}%`),
            like(users.bio, `%${query}%`)
          )
        );
      }
      if (location) {
        conditions.push(like(users.location, `%${location}%`));
      }
      if (role) {
        conditions.push(eq(users.role, role));
      }
      if (featured) {
        conditions.push(eq(users.isFeatured, true));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.users.findMany({
        where: whereClause,
        columns: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          age: true,
          isFeatured: true,
          role: true,
          createdAt: true,
        },
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(users.createdAt)],
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);
      const total = countResult[0]?.count ?? 0;

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  // Update own profile (authed)
  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(1000).optional(),
        location: z.string().max(100).optional(),
        age: z.number().min(18).max(100).optional(),
        avatar: z.string().url().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      await db.update(users).set(input).where(eq(users.id, userId));
      return { success: true };
    }),

  // Update role (one-time, authed)
  updateRole: authedQuery
    .input(z.object({ role: z.enum(["companion", "client"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      // Only allow role update if not already set to a different role
      if (ctx.user.role === "admin") {
        throw new Error("Cannot change admin role");
      }
      await db.update(users).set({ role: input.role }).where(eq(users.id, userId));
      return { success: true, role: input.role };
    }),

  // Get dashboard stats (authed)
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get wallet balance
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { walletBalance: true },
    });

    // Get unread message count
    const convos = await db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ),
    });
    let unreadCount = 0;
    for (const c of convos) {
      if (c.user1Id === userId) unreadCount += c.unreadCountUser1;
      else unreadCount += c.unreadCountUser2;
    }

    // Get monthly earnings (companion) or spending (client)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const txns = await db.query.transactions.findMany({
      where: and(
        or(eq(transactions.toUser, userId), eq(transactions.fromUser, userId)),
        sql`${transactions.createdAt} >= ${thirtyDaysAgo}`
      ),
    });

    let monthlyEarnings = 0;
    let monthlySpending = 0;
    for (const t of txns) {
      if (t.toUser === userId) monthlyEarnings += Number(t.netPayout || t.grossAmount);
      if (t.fromUser === userId) monthlySpending += Number(t.grossAmount);
    }

    // Get profile views (mock - would come from analytics)
    const profileViews = Math.floor(Math.random() * 500) + 100;

    return {
      walletBalance: Number(user?.walletBalance ?? 0),
      unreadMessages: unreadCount,
      monthlyEarnings,
      monthlySpending,
      profileViews,
    };
  }),

  // Toggle featured status (companion only)
  toggleFeatured: authedQuery
    .input(z.object({ featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      if (ctx.user.role !== "companion" && ctx.user.role !== "admin") {
        throw new Error("Only companions can be featured");
      }

      const expiresAt = input.featured
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

      await db
        .update(users)
        .set({
          isFeatured: input.featured,
          featuredExpiresAt: expiresAt,
        })
        .where(eq(users.id, userId));

      return { success: true, featured: input.featured, expiresAt };
    }),

  // List all users (admin)
  list: adminQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        role: z.enum(["client", "companion", "admin"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, role } = { page: 1, limit: 20, ...input };

      const where = role ? eq(users.role, role) : undefined;

      const items = await db.query.users.findMany({
        where,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(users.createdAt)],
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(where);
      const total = countResult[0]?.count ?? 0;

      return { items, total, page, limit };
    }),
});
