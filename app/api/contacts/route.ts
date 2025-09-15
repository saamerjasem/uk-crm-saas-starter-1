export async function POST(req: NextRequest) {
  try {
    const host = getHost(req as unknown as Request);
    const body = await req.json();
    const { first_name, last_name, email, phone } = body || {};

    if (!first_name || !last_name) {
      return NextResponse.json({ error: "first_name and last_name required" }, { status: 400 });
    }

    const data = await withTenant(host, async (client) => {
      const { rows } = await client.query(
        `insert into contacts(first_name, last_name, email, phone, tenant_id)
         values ($1,$2,$3,$4, current_setting('app.tenant_id', true)::uuid)
         returning id`,
        [first_name, last_name, email || null, phone || null]
      );
      return rows[0];
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    // temporary visibility to find the cause
    return NextResponse.json(
      { error: "insert_failed", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
