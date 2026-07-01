import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify admin
    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get gift stats
    const { data: totalStats } = await supabase
      .from("gift_transactions")
      .select("coin_cost, companion_share, platform_share");

    const totalVolume = totalStats?.reduce((sum, tx) => sum + (tx.coin_cost || 0), 0) || 0;
    const totalCompanion = totalStats?.reduce((sum, tx) => sum + (tx.companion_share || 0), 0) || 0;
    const totalPlatform = totalStats?.reduce((sum, tx) => sum + (tx.platform_share || 0), 0) || 0;

    // Get top gifts
    const { data: topGifts } = await supabase
      .from("gift_transactions")
      .select("gift_item_id, gift_item:gift_item_id(name, icon, coin_cost), count")
      .order("count", { ascending: false })
      .limit(5);

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from("gift_transactions")
      .select(`
        *,
        gift_item:gift_item_id(name, icon),
        sender:sender_id(display_name),
        receiver:receiver_id(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      stats: {
        totalVolume,
        totalCompanion,
        totalPlatform,
        transactionCount: totalStats?.length || 0,
      },
      topGifts: topGifts || [],
      recentTransactions: recentTransactions || [],
    });
  } catch (err) {
    console.error("Admin gift stats error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
