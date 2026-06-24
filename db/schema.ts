import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  boolean,
  int,
  json,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  oauthId: varchar("oauth_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["client", "companion", "admin"]).default("client").notNull(),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  age: int("age"),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredExpiresAt: timestamp("featured_expires_at"),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: bigint("referred_by", { mode: "number", unsigned: true }),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "inactive", "cancelled"]).default("inactive").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Subscriptions ───────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  plan: mysqlEnum("plan", ["companion", "client"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionRef: varchar("transaction_ref", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ─── Conversations ───────────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: bigint("user1_id", { mode: "number", unsigned: true }).notNull(),
  user2Id: bigint("user2_id", { mode: "number", unsigned: true }).notNull(),
  lastMessageAt: timestamp("last_message_at"),
  unreadCountUser1: int("unread_count_user1").notNull().default(0),
  unreadCountUser2: int("unread_count_user2").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

// ─── Messages ────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(),
  receiverId: bigint("receiver_id", { mode: "number", unsigned: true }).notNull(),
  conversationId: bigint("conversation_id", { mode: "number", unsigned: true }).notNull(),
  content: text("content"),
  mediaUrl: varchar("media_url", { length: 500 }),
  mediaPrice: decimal("media_price", { precision: 10, scale: 2 }).default("0"),
  isPaid: boolean("is_paid").notNull().default(false),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockReason: varchar("block_reason", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// ─── Transactions ────────────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  fromUser: bigint("from_user", { mode: "number", unsigned: true }),
  toUser: bigint("to_user", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", [
    "subscription",
    "media_sale",
    "gift",
    "tip",
    "featured_fee",
    "withdrawal",
    "referral_bonus",
  ]).notNull(),
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  platformCut: decimal("platform_cut", { precision: 10, scale: 2 }).default("0"),
  companionCut: decimal("companion_cut", { precision: 10, scale: 2 }).default("0"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0"),
  netPayout: decimal("net_payout", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("completed").notNull(),
  paymentGateway: varchar("payment_gateway", { length: 50 }),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;

// ─── Withdrawal Requests ─────────────────────────────────────────────
export const withdrawalRequests = mysqlTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  companionId: bigint("companion_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDetails: json("payment_details"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

// ─── Gifts ───────────────────────────────────────────────────────────
export const gifts = mysqlTable("gifts", {
  id: serial("id").primaryKey(),
  fromClient: bigint("from_client", { mode: "number", unsigned: true }).notNull(),
  toCompanion: bigint("to_companion", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  companionShare: decimal("companion_share", { precision: 10, scale: 2 }).notNull(),
  platformShare: decimal("platform_share", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Gift = typeof gifts.$inferSelect;

// ─── Referrals ───────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: bigint("referrer_id", { mode: "number", unsigned: true }).notNull(),
  referredUserId: bigint("referred_user_id", { mode: "number", unsigned: true }).notNull(),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).default("5.00"),
  rewardPaid: boolean("reward_paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;

// ─── Blog Posts ──────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  metaDescription: varchar("meta_description", { length: 300 }),
  keywords: json("keywords"),
  seoScore: int("seo_score"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  generatedBy: varchar("generated_by", { length: 50 }).default("gpt-4"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;

// ─── DM Violations ───────────────────────────────────────────────────
export const dmViolations = mysqlTable("dm_violations", {
  id: serial("id").primaryKey(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(),
  receiverId: bigint("receiver_id", { mode: "number", unsigned: true }).notNull(),
  attemptedContent: text("attempted_content"),
  violationType: varchar("violation_type", { length: 50 }).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

export type DmViolation = typeof dmViolations.$inferSelect;

// ─── Ad Campaigns ────────────────────────────────────────────────────
export const adCampaigns = mysqlTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  signups: int("signups").default(0),
  costPerSignup: decimal("cost_per_signup", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "paused", "ended"]).default("active").notNull(),
  date: date("date").notNull(),
});

export type AdCampaign = typeof adCampaigns.$inferSelect;

// ─── Signup Targets ──────────────────────────────────────────────────
export const signupTargets = mysqlTable("signup_targets", {
  id: serial("id").primaryKey(),
  period: mysqlEnum("period", ["daily", "weekly"]).notNull(),
  targetCount: int("target_count").notNull(),
  currentCount: int("current_count").default(0),
  setAt: timestamp("set_at").defaultNow().notNull(),
});

export type SignupTarget = typeof signupTargets.$inferSelect;
