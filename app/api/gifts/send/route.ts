import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { sendGiftSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = sendGiftSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { conversation_id, gift_item_id, personal_message } = validation.data;
    const supabase = await createClient();

    // Get the sender's DB user
    const { data: sender } = await supabase
      .from("users")
      .select("id, coins, role")
      .eq("clerk_id", userId)
      .single();

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (sender.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can send gifts" },
        { status: 403 }
      );
    }

    // Get the conversation and verify membership
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, client_id, companion_id")
      .eq("id", conversation_id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.client_id !== sender.id) {
      return NextResponse.json(
        { error: "You are not a member of this conversation" },
        { status: 403 }
      );
    }

    // Get gift item
    const { data: giftItem } = await supabase
      .from("gift_items")
      .select("id, name, icon, coin_cost")
      .eq("id", gift_item_id)
      .eq("is_active", true)
      .single();

    if (!giftItem) {
      return NextResponse.json(
        { error: "Gift item not found or inactive" },
        { status: 404 }
      );
    }

    // Get gift split setting
    const { data: splitSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "platform_gift_commission")
      .single();

    const splitPercent = splitSetting ? 100 - parseInt(splitSetting.value) : 50;

    // Check minimum coins setting
    const { data: minCoinsSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "gift_min_coins")
      .single();

    const minCoins = minCoinsSetting ? parseInt(minCoinsSetting.value) : 10;

    if (giftItem.coin_cost < minCoins) {
      return NextResponse.json(
        { error: `Minimum gift cost is ${minCoins} coins` },
        { status: 400 }
      );
    }

    // Check if user has enough coins
    if (sender.coins < giftItem.coin_cost) {
      return NextResponse.json(
        { error: "Insufficient coins", needed: giftItem.coin_cost, have: sender.coins },
        { status: 400 }
      );
    }

    // Call the atomic send_gift function
    const { data: result, error: rpcError } = await supabase.rpc("send_gift", {
      p_sender_id: sender.id,
      p_receiver_id: conversation.companion_id,
      p_conversation_id: conversation_id,
      p_gift_item_id: gift_item_id,
      p_coin_cost: giftItem.coin_cost,
      p_split_percent: splitPercent,
      p_personal_message: personal_message || `Sent a ${giftItem.name} ${giftItem.icon}!`,
    });

    if (rpcError) {
      console.error("Gift send RPC error:", rpcError);
      return NextResponse.json(
        { error: "Failed to send gift", details: rpcError.message },
        { status: 500 }
      );
    }

    const resultData = result as { success: boolean; error?: string; gift_transaction_id?: string; message_id?: string };

    if (!resultData?.success) {
      return NextResponse.json(
        { error: resultData?.error || "Failed to send gift" },
        { status: 400 }
      );
    }

    // Get the created gift transaction with details
    const { data: giftTx } = await supabase
      .from("gift_transactions")
      .select(`
        *,
        gift_item:gift_item_id(name, icon, coin_cost),
        sender:sender_id(display_name, avatar_url),
        receiver:receiver_id(display_name, avatar_url)
      `)
      .eq("id", resultData.gift_transaction_id)
      .single();

    return NextResponse.json({
      success: true,
      gift_transaction: giftTx,
      message_id: resultData.message_id,
      remaining_coins: sender.coins - giftItem.coin_cost,
    });
  } catch (err) {
    console.error("Gift send error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
