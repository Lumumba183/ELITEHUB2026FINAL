import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // 'sent', 'received', 'all'

    const supabase = await createClient();

    // Get user's DB id
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query = supabase
      .from("gift_transactions")
      .select(`
        *,
        gift_item:gift_item_id(name, icon, coin_cost),
        sender:sender_id(display_name, avatar_url),
        receiver:receiver_id(display_name, avatar_url)
      `);

    if (type === "sent") {
      query = query.eq("sender_id", user.id);
    } else if (type === "received") {
      query = query.eq("receiver_id", user.id);
    } else {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }

    const { data: giftTransactions, error } = await query
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching gift history:", error);
      return NextResponse.json(
        { error: "Failed to fetch gift history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftTransactions });
  } catch (err) {
    console.error("Gift history error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
