import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pesapalCallbackSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = pesapalCallbackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const supabase = createAdminClient();

    // PesaPal callback data structure
    const orderTrackingId = data.orderTrackingId;
    const merchantReference = data.merchantReference;
    const status = data.status;

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Missing order tracking ID" }, { status: 400 });
    }

    // Update transaction
    const { error } = await supabase
      .from("payment_transactions")
      .update({
        status: status?.toLowerCase() === "completed" ? "completed" : "pending",
        pesapal_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("order_tracking_id", orderTrackingId);

    if (error) {
      console.error("PesaPal callback error:", error);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PesaPal callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
