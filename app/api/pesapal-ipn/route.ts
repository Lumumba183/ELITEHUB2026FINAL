import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pesapalIPNSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = pesapalIPNSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const supabase = createAdminClient();

    const orderTrackingId = data.OrderTrackingId;
    const status = data.Status;
    const paymentMethod = data.PaymentMethod || null;

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Missing order tracking ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("payment_transactions")
      .update({
        status: status?.toLowerCase() === "completed" ? "completed" : "pending",
        payment_method: paymentMethod,
        pesapal_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("order_tracking_id", orderTrackingId);

    if (error) {
      console.error("PesaPal IPN error:", error);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    // If payment completed, credit user coins
    if (status?.toLowerCase() === "completed") {
      const { data: tx } = await supabase
        .from("payment_transactions")
        .select("user_id, amount, description")
        .eq("order_tracking_id", orderTrackingId)
        .single();

      if (tx) {
        // Add coin transaction
        await supabase.from("coin_transactions").insert({
          user_id: tx.user_id,
          type: "purchase",
          amount: tx.amount,
          description: tx.description || "Coin purchase",
        });

        // Update user coins
        await supabase.rpc("increment_coins", {
          user_id: tx.user_id,
          amount: tx.amount,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PesaPal IPN error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
