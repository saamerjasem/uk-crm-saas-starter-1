"use client";
import { useEffect, useState } from "react";

type Contact = { id:string; first_name:string; last_name:string; email:string|null; phone:string|null };

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ first_name:"", last_name:"", email:"" });

  async function load() {
    setLoading(true);
    const r = await fetch("/api/contacts", { cache:"no-store" });
    const j = await r.json();
    setData(j.contacts || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if(!form.first_name || !form.last_name) return;
    await fetch("/api/contacts", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify(form)
    });
    setForm({ first_name:"", last_name:"", email:"" });
    load();
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>New contact</h2>
        <form onSubmit={createContact} className="grid grid-2">
          <input placeholder="First name" value={form.first_name} onChange={e=>setForm(f=>({...f, first_name:e.target.value}))}/>
          <input placeholder="Last name" value={form.last_name} onChange={e=>setForm(f=>({...f, last_name:e.target.value}))}/>
          <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
          <div><button>Add contact</button></div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Contacts</h2>
        {loading ? <p>Loading…</p> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {data.map(c=>(
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
