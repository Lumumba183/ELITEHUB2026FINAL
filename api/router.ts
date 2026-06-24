import { authRouter } from "./auth-router";
import { userRouter } from "./user-router";
import { messageRouter } from "./message-router";
import { paymentRouter } from "./payment-router";
import { giftRouter } from "./gift-router";
import { blogRouter } from "./blog-router";
import { adminRouter } from "./admin-router";
import { referralRouter } from "./referral-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: userRouter,
  message: messageRouter,
  payment: paymentRouter,
  gift: giftRouter,
  blog: blogRouter,
  admin: adminRouter,
  referral: referralRouter,
});

export type AppRouter = typeof appRouter;
