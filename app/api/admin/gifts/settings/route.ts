import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { giftSettingsSchema } from "@/lib/validation";

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

    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["platform_gift_commission", "gifts_enabled", "gift_min_coins"]);

    const settingsMap = (settings || []).reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      split_percent: 100 - parseInt(settingsMap.platform_gift_commission || "50"),
      platform_percent: parseInt(settingsMap.platform_gift_commission || "50"),
      gifts_enabled: settingsMap.gifts_enabled === "true",
      gift_min_coins: parseInt(settingsMap.gift_min_coins || "10"),
    });
  } catch (err) {
    console.error("Gift settings GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = giftSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { split_percent, gifts_enabled, gift_min_coins } = validation.data;
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

    // Update platform_settings (companion gets split_percent, platform gets remainder)
    const platformPercent = 100 - split_percent;

    await supabase
      .from("platform_settings")
      .update({ value: platformPercent.toString() })
      .eq("key", "platform_gift_commission");

    await supabase
      .from("platform_settings")
      .update({ value: gifts_enabled.toString() })
      .eq("key", "gifts_enabled");

    await supabase
      .from("platform_settings")
      .update({ value: gift_min_coins.toString() })
      .eq("key", "gift_min_coins");

    return NextResponse.json({
      success: true,
      settings: {
        split_percent,
        platform_percent: platformPercent,
        gifts_enabled,
        gift_min_coins,
      },
    });
  } catch (err) {
    console.error("Gift settings PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
