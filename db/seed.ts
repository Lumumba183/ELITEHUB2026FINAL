import { getDb } from "../api/queries/connection";
import {
  users,
  blogPosts,
  adCampaigns,
  signupTargets,
  transactions,
  messages,
  conversations,
  dmViolations,
  withdrawalRequests,
  gifts,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed blog posts
  const existingPosts = await db.query.blogPosts.findMany({ limit: 1 });
  if (existingPosts.length === 0) {
    console.log("Seeding blog posts...");
    await db.insert(blogPosts).values([
      {
        title: "The Future of Digital Companionship",
        slug: "future-of-digital-companionship",
        content: `<p>The landscape of digital companionship is evolving at an unprecedented pace. As technology advances and societal norms shift, platforms like EliteHub are at the forefront of a new era in human connection.</p>
      <h2>Why Digital Companionship Matters</h2>
      <p>In an increasingly connected yet isolating world, digital companionship offers a unique blend of intimacy, safety, and convenience. It allows people to form meaningful connections without the constraints of geography or traditional social barriers.</p>
      <h2>The EliteHub Difference</h2>
      <p>Unlike traditional platforms, EliteHub prioritizes security, transparency, and fair compensation. Our 50/50 revenue split ensures that companions are fairly rewarded for their time and effort, while our advanced security features protect both parties.</p>
      <h2>Looking Ahead</h2>
      <p>As AI and automation continue to reshape the industry, EliteHub remains committed to the human element. Our AI-powered tools help companions grow their audience and optimize their profiles, but the connections themselves remain authentically human.</p>`,
        metaDescription: "Explore how digital companionship is evolving and why EliteHub is leading the charge in this new era of human connection.",
        keywords: JSON.stringify(["companionship", "digital", "future", "elitehub"]),
        seoScore: 92,
        status: "published",
      },
      {
        title: "How Top Creators Earn $10K+ Monthly",
        slug: "top-creators-earn-10k-monthly",
        content: `<p>Earning a substantial income as a digital companion is not just possible—it's becoming increasingly common. Here's how top creators on EliteHub are building six-figure incomes.</p>
      <h2>Build Your Brand</h2>
      <p>Successful creators treat their profile as a brand. Professional photos, a compelling bio, and consistent engagement are the foundation of a thriving presence.</p>
      <h2>Leverage Featured Placement</h2>
      <p>Investing in featured placement on the homepage can increase visibility by up to 300%. Top creators consistently reinvest a portion of their earnings into growth.</p>
      <h2>Diversify Revenue Streams</h2>
      <p>The highest earners combine subscriptions, media sales, gifts, and tips. Don't rely on a single income source—offer multiple ways for clients to engage.</p>
      <h2>Use AI Tools</h2>
      <p>EliteHub's AI-powered content generation and marketing automation help creators maintain a consistent presence without burning out.</p>`,
        metaDescription: "Learn the strategies top EliteHub creators use to earn $10,000+ per month through digital companionship.",
        keywords: JSON.stringify(["earnings", "income", "creators", "tips", "elitehub"]),
        seoScore: 88,
        status: "published",
      },
      {
        title: "Security & Privacy: Our Top Priority",
        slug: "security-privacy-top-priority",
        content: `<p>At EliteHub, we believe that trust is the foundation of every meaningful connection. That's why we've built the most secure platform in the industry.</p>
      <h2>End-to-End Encryption</h2>
      <p>All messages on EliteHub are protected with industry-standard encryption. Your conversations remain private—always.</p>
      <h2>Contact Detection System</h2>
      <p>Our advanced DM scanning technology automatically detects and blocks attempts to share contact information, keeping all interactions safely on-platform.</p>
      <h2>Secure Payments</h2>
      <p>Whether you prefer M-Pesa or international card payments through PesaPal, every transaction is processed through PCI-compliant systems with full encryption.</p>
      <h2>Data Protection</h2>
      <p>We never sell your data. Period. Your information is stored securely and only used to provide and improve our services.</p>`,
        metaDescription: "Discover how EliteHub prioritizes security and privacy with encrypted messaging, contact detection, and secure payments.",
        keywords: JSON.stringify(["security", "privacy", "encryption", "payments", "elitehub"]),
        seoScore: 95,
        status: "published",
      },
    ]);
  }

  // Seed ad campaigns
  const existingCampaigns = await db.query.adCampaigns.findMany({ limit: 1 });
  if (existingCampaigns.length === 0) {
    console.log("Seeding ad campaigns...");
    const today = new Date();
    await db.insert(adCampaigns).values([
      { platform: "meta", campaignName: "Facebook Companions", spend: "1250.00", impressions: 45000, clicks: 1800, signups: 85, costPerSignup: "14.71", status: "active", date: today },
      { platform: "google", campaignName: "Search - Elite Companion", spend: "980.00", impressions: 32000, clicks: 1200, signups: 62, costPerSignup: "15.81", status: "active", date: today },
      { platform: "trafficjunky", campaignName: "Adult Network Boost", spend: "2100.00", impressions: 120000, clicks: 5400, signups: 143, costPerSignup: "14.69", status: "active", date: today },
      { platform: "exoclick", campaignName: "Display Network Wide", spend: "750.00", impressions: 28000, clicks: 890, signups: 38, costPerSignup: "19.74", status: "paused", date: today },
    ]);
  }

  // Seed signup targets
  const existingTargets = await db.query.signupTargets.findMany({ limit: 1 });
  if (existingTargets.length === 0) {
    console.log("Seeding signup targets...");
    await db.insert(signupTargets).values([
      { period: "daily", targetCount: 100, currentCount: 85 },
      { period: "weekly", targetCount: 700, currentCount: 593 },
    ]);
  }

  // Seed sample users (companions)
  const existingUsers = await db.query.users.findMany({ limit: 1 });
  if (existingUsers.length === 0) {
    console.log("Seeding sample users...");
    await db.insert(users).values([
      {
        oauthId: "demo_companion_1",
        email: "sophia@elitehub.demo",
        name: "Sophia Chen",
        avatar: "/assets/companion-avatar-1.jpg",
        role: "companion",
        bio: "Elite companion specializing in meaningful conversations and luxury experiences. Based in New York, available worldwide.",
        location: "New York, USA",
        age: 26,
        isFeatured: true,
        walletBalance: "3240.50",
        subscriptionStatus: "active",
      },
      {
        oauthId: "demo_companion_2",
        email: "marcus@elitehub.demo",
        name: "Marcus Rivera",
        avatar: "/assets/companion-avatar-2.jpg",
        role: "companion",
        bio: "Charismatic and sophisticated. I provide premium companionship for discerning clients who value quality connections.",
        location: "London, UK",
        age: 32,
        isFeatured: true,
        walletBalance: "1875.00",
        subscriptionStatus: "active",
      },
      {
        oauthId: "demo_companion_3",
        email: "isabella@elitehub.demo",
        name: "Isabella Romano",
        avatar: "/assets/companion-avatar-3.jpg",
        role: "companion",
        bio: "Italian elegance meets modern sophistication. Let me show you the art of true companionship.",
        location: "Milan, Italy",
        age: 28,
        isFeatured: true,
        walletBalance: "4520.75",
        subscriptionStatus: "active",
      },
      {
        oauthId: "demo_companion_4",
        email: "victoria@elitehub.demo",
        name: "Victoria Ashford",
        avatar: "/assets/companion-avatar-4.jpg",
        role: "companion",
        bio: "Dramatic, artistic, and unforgettable. I create experiences that linger in your memory long after we part.",
        location: "Los Angeles, USA",
        age: 24,
        isFeatured: false,
        walletBalance: "980.25",
        subscriptionStatus: "active",
      },
      {
        oauthId: "demo_companion_5",
        email: "james@elitehub.demo",
        name: "James Whitfield",
        avatar: "/assets/companion-avatar-5.jpg",
        role: "companion",
        bio: "Distinguished gentleman offering premium companionship. Business professional by day, your perfect companion by night.",
        location: "Dubai, UAE",
        age: 35,
        isFeatured: true,
        walletBalance: "5600.00",
        subscriptionStatus: "active",
      },
      {
        oauthId: "demo_companion_6",
        email: "anastasia@elitehub.demo",
        name: "Anastasia Volkov",
        avatar: "/assets/companion-avatar-6.jpg",
        role: "companion",
        bio: "Mysterious, elegant, and captivating. I bring a touch of European sophistication to every encounter.",
        location: "Paris, France",
        age: 27,
        isFeatured: false,
        walletBalance: "2150.00",
        subscriptionStatus: "active",
      },
    ]);
  }

  // Seed sample transactions
  const existingTxns = await db.query.transactions.findMany({ limit: 1 });
  if (existingTxns.length === 0) {
    console.log("Seeding sample transactions...");
    await db.insert(transactions).values([
      { fromUser: 1, toUser: 2, type: "gift", grossAmount: "100.00", platformCut: "50.00", companionCut: "50.00", netPayout: "50.00", status: "completed" },
      { fromUser: 2, toUser: 1, type: "media_sale", grossAmount: "50.00", platformCut: "25.00", companionCut: "25.00", netPayout: "25.00", status: "completed" },
      { fromUser: 1, toUser: 3, type: "tip", grossAmount: "200.00", platformCut: "100.00", companionCut: "100.00", netPayout: "100.00", status: "completed" },
      { fromUser: 3, type: "subscription", grossAmount: "20.00", platformCut: "20.00", status: "completed" },
      { fromUser: 2, type: "featured_fee", grossAmount: "50.00", platformCut: "50.00", status: "completed" },
    ]);
  }

  // Seed sample DM violations
  const existingViolations = await db.query.dmViolations.findMany({ limit: 1 });
  if (existingViolations.length === 0) {
    console.log("Seeding sample violations...");
    await db.insert(dmViolations).values([
      { senderId: 1, receiverId: 2, attemptedContent: "My number is +254712345678", violationType: "phone" },
      { senderId: 2, receiverId: 3, attemptedContent: "Add me on instagram @user123", violationType: "social_link" },
      { senderId: 3, receiverId: 1, attemptedContent: "Email me at test@gmail.com", violationType: "email" },
    ]);
  }

  // Seed sample withdrawal requests
  const existingWithdrawals = await db.query.withdrawalRequests.findMany({ limit: 1 });
  if (existingWithdrawals.length === 0) {
    console.log("Seeding sample withdrawals...");
    await db.insert(withdrawalRequests).values([
      { companionId: 1, amount: "500.00", processingFee: "25.00", netAmount: "475.00", paymentMethod: "mpesa", paymentDetails: JSON.stringify({ phoneNumber: "+254712345678" }), status: "pending" },
      { companionId: 2, amount: "1000.00", processingFee: "50.00", netAmount: "950.00", paymentMethod: "bank_transfer", paymentDetails: JSON.stringify({ accountNumber: "1234567890", bankName: "Chase" }), status: "completed", processedAt: new Date() },
    ]);
  }

  // Seed sample gifts
  const existingGifts = await db.query.gifts.findMany({ limit: 1 });
  if (existingGifts.length === 0) {
    console.log("Seeding sample gifts...");
    await db.insert(gifts).values([
      { fromClient: 1, toCompanion: 2, amount: "100.00", companionShare: "50.00", platformShare: "50.00", message: "Thank you for the wonderful evening!" },
      { fromClient: 2, toCompanion: 3, amount: "250.00", companionShare: "125.00", platformShare: "125.00", message: "You are absolutely amazing!" },
    ]);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
