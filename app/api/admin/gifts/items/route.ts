import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { giftItemSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: giftItems, error } = await supabase
      .from("gift_items")
      .select("*")
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
    console.error("Admin gift items GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = giftItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("gift_items")
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      console.error("Error creating gift item:", error);
      return NextResponse.json(
        { error: "Failed to create gift item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftItem: data });
  } catch (err) {
    console.error("Admin gift items POST error:", err);
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Gift item ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("gift_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating gift item:", error);
      return NextResponse.json(
        { error: "Failed to update gift item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftItem: data });
  } catch (err) {
    console.error("Admin gift items PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift item ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("gift_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gift item:", error);
      return NextResponse.json(
        { error: "Failed to delete gift item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin gift items DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
