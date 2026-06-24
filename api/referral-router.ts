import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, referrals } from "@db/schema";

export const referralRouter = createRouter({
  // Get own referral code
  getCode: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    let user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { referralCode: true },
    });

    // Generate code if not exists
    if (!user?.referralCode) {
      const code = `EH${userId}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await db.update(users)
        .set({ referralCode: code })
        .where(eq(users.id, userId));
      user = { referralCode: code };
    }

    return { code: user.referralCode };
  }),

  // Get referral stats
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const refs = await db.query.referrals.findMany({
      where: eq(referrals.referrerId, userId),
      orderBy: [desc(referrals.createdAt)],
    });

    const totalReferrals = refs.length;
    const totalEarnings = refs.reduce((sum, r) => sum + Number(r.rewardAmount), 0);
    const paidEarnings = refs
      .filter((r) => r.rewardPaid)
      .reduce((sum, r) => sum + Number(r.rewardAmount), 0);

    return {
      totalReferrals,
      totalEarnings,
      paidEarnings,
      pendingEarnings: totalEarnings - paidEarnings,
      referrals: refs,
    };
  }),

  // Apply referral code during signup
  apply: authedQuery
    .input(z.object({ code: z.string().min(4).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { code } = input;

      // Find referrer
      const referrer = await db.query.users.findFirst({
        where: eq(users.referralCode, code),
        columns: { id: true, referralCode: true },
      });

      if (!referrer) {
        throw new Error("Invalid referral code");
      }

      if (referrer.id === userId) {
        throw new Error("Cannot refer yourself");
      }

      // Check if already referred
      const existing = await db.query.referrals.findFirst({
        where: eq(referrals.referredUserId, userId),
      });

      if (existing) {
        throw new Error("You have already used a referral code");
      }

      // Create referral record
      const rewardAmount = 5.0;
      await db.insert(referrals).values({
        referrerId: referrer.id,
        referredUserId: userId,
        rewardAmount: String(rewardAmount),
        rewardPaid: false,
      });

      // Update referred_by on user
      await db.update(users)
        .set({ referredBy: referrer.id })
        .where(eq(users.id, userId));

      return {
        success: true,
        referrerId: referrer.id,
        rewardAmount,
      };
    }),
});
