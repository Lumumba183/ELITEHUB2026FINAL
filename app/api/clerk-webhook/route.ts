import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret missing", { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const supabase = createAdminClient();

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const role = (public_metadata?.role as string) || "client";

    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: id,
        email,
        display_name: first_name || last_name ? `${first_name || ""} ${last_name || ""}`.trim() : null,
        avatar_url: image_url,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      console.error("Supabase sync error:", error);
      return new Response("Sync failed", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    await supabase.from("users").delete().eq("clerk_id", id);
  }

  return new Response("OK", { status: 200 });
}
