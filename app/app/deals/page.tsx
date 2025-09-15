"use client";
import { useEffect, useState } from "react";

type Deal = { id:string; title:string; value:number; currency:string; stage?:string; status:string };

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [form, setForm] = useState({ title:"", value: "" as any });

  async function load() {
    const r = await fetch("/api/deals", { cache:"no-store" });
    const j = await r.json();
    setData(j.deals || []);
  }
  useEffect(() => { load(); }, []);

  async function createDeal(e: React.FormEvent) {
    e.preventDefault();
    if(!form.title) return;
    await fetch("/api/deals", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ title: form.title, value: Number(form.value || 0) })
    });
    setForm({ title:"", value:"" });
    load();
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>New deal</h2>
        <form onSubmit={createDeal} className="grid grid-2">
          <input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))}/>
          <input placeholder="Value £" type="number" value={form.value} onChange={e=>setForm(f=>({...f, value:e.target.value}))}/>
          <div><button>Add deal</button></div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Deals</h2>
        <table className="table">
          <thead><tr><th>Title</th><th>Value</th><th>Stage</th><th>Status</th></tr></thead>
          <tbody>
            {data.map(d=>(
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>£{Number(d.value || 0).toLocaleString()}</td>
                <td>{d.stage || "New"}</td>
                <td><span className="badge">{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
