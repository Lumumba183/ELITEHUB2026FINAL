import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: giftItems, error } = await supabase
      .from("gift_items")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("sort_order");

    if (error) {
      console.error("Error fetching gift items:", error);
      return NextResponse.json(
        { error: "Failed to fetch gift items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftItems });
  } catch (err) {
    console.error("Gift items error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
