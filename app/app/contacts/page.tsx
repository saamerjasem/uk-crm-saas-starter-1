"use client";
import { useEffect, useState } from "react";

type Contact = { id:string; first_name:string; last_name:string; email:string|null; phone:string|null };

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name:"", last_name:"", email:"" });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      // cache bust with a timestamp, plus `no-store` to be extra safe
      const r = await fetch(`/api/contacts?ts=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`GET /api/contacts ${r.status}`);
      const j = await r.json();
      setData(j.contacts || []);
    } catch (e:any) {
      setErr(e.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name) return;

    try {
      setSaving(true);
      setErr(null);

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`POST /api/contacts ${res.status} ${msg}`);
      }

      const { id } = await res.json();

      // optimistic update so the row appears immediately
      setData(d => [
        { id, first_name: form.first_name, last_name: form.last_name, email: form.email || null, phone: null },
        ...d
      ]);

      setForm({ first_name:"", last_name:"", email:"" });

      // also re-fetch to stay perfectly in sync with DB
      load();
    } catch (e:any) {
      setErr(e.message || "Failed to add contact");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>New contact</h2>
        <form onSubmit={createContact} className="grid grid-2">
          <input placeholder="First name" value={form.first_name}
                 onChange={e=>setForm(f=>({ ...f, first_name: e.target.value }))}/>
          <input placeholder="Last name" value={form.last_name}
                 onChange={e=>setForm(f=>({ ...f, last_name: e.target.value }))}/>
          <input placeholder="Email" type="email" value={form.email}
                 onChange={e=>setForm(f=>({ ...f, email: e.target.value }))}/>
          <div><button disabled={saving}>{saving ? "Adding…" : "Add contact"}</button></div>
        </form>
        {err && <p style={{ color:"#fca5a5", marginTop:8 }}>{err}</p>}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Contacts</h2>
        {loading ? <p>Loading…</p> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td>{c.first_name} {c.last_name}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
