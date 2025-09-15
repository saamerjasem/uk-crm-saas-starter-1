import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { withAdmin } from "@/src/server/db";

export const runtime = "nodejs"; // Stripe needs the Node runtime

// Stripe strongly types against a specific apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature");
    const whsec = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !whsec) {
      return NextResponse.json({ error: "Missing Stripe headers" }, { status: 400 });
    }

    const buf = Buffer.from(await req.arrayBuffer());
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, whsec);
    } catch (e: any) {
      return NextResponse.json(
        { error: "Invalid signature", detail: String(e?.message || e) },
        { status: 400 }
      );
    }

    // Optional persistence, ignored if table does not exist
    try {
      await withAdmin(async (client) => {
        await client.query(
          `insert into stripe_events(id, type, raw)
           values ($1, $2, $3)
           on conflict (id) do nothing`,
          [event.id, event.type, JSON.stringify(event)]
        );
      });
    } catch {
      // swallow storage errors so the webhook still returns 200
    }

    // Handle key event types here later if you want
    // switch (event.type) { ... }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "webhook_failed", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
