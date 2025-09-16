import { NextRequest, NextResponse } from "next/server";
import { withTenant } from "@/src/server/db";
import { getHost } from "@/src/server/host";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const host = getHost(req as unknown as Request);
    const contact = await withTenant(host, async (client, { tenantId }) => {
      const { rows } = await client.query(
        `select id, first_name, last_name, email, phone
           from contacts
          where id = $1 and tenant_id = $2
          limit 1`,
        [params.id, tenantId]
      );
      return rows[0] || null;
    });
    if (!contact) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ contact });
  } catch (e: any) {
    return NextResponse.json({ error: "fetch_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const host = getHost(req as unknown as Request);
    const body = await req.json();
    const { first_name, last_name, email, phone } = body || {};
    if (!first_name || !last_name) {
      return NextResponse.json({ error: "first_name and last_name required" }, { status: 400 });
    }

    const updated = await withTenant(host, async (client, { tenantId }) => {
      const { rows } = await client.query(
        `update contacts
            set first_name = $1, last_name = $2, email = $3, phone = $4
          where id = $5 and tenant_id = $6
          returning id`,
        [first_name, last_name, email || null, phone || null, params.id, tenantId]
      );
      return rows[0] || null;
    });

    if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e: any) {
    return NextResponse.json({ error: "update_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const host = getHost(req as unknown as Request);
    const removed = await withTenant(host, async (client, { tenantId }) => {
      const { rows } = await client.query(
        `delete from contacts
          where id = $1 and tenant_id = $2
          returning id`,
        [params.id, tenantId]
      );
      return rows[0] || null;
    });
    if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "delete_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}
