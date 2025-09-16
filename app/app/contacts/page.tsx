"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // header controls
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/contacts?ts=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`GET /api/contacts ${r.status}`);
      const j = await r.json();
      setContacts(j.contacts ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;

    try {
      setSaving(true);
      setErr(null);
      const r = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`POST /api/contacts ${r.status} ${t}`);
      }
      setForm({ first_name: "", last_name: "", email: "", phone: "" });
      setShowAdd(false);
      load();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add contact");
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, contacts]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold">Contacts</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-full md:w-96 h-10 rounded border border-gray-700/70 bg-black/20 px-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="h-10 rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-white hover:opacity-95 active:opacity-90"
          >
            {showAdd ? "Cancel" : "Add Contact"}
          </button>
        </div>
      </div>

      {/* Add contact (compact) */}
      {showAdd && (
        <form
          onSubmit={createContact}
          className="mt-4 grid gap-3 md:grid-cols-4"
        >
          <input
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            className="h-10 rounded border border-gray-700/70 bg-black/20 px-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <input
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            className="h-10 rounded border border-gray-700/70 bg-black/20 px-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="h-10 rounded border border-gray-700/70 bg-black/20 px-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <div className="flex gap-2">
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-10 flex-1 rounded border border-gray-700/70 bg-black/20 px-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <button
              disabled={saving}
              className="h-10 whitespace-nowrap rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Errors */}
      {err && <p className="mt-3 text-red-400">{err}</p>}

      {/* Table */}
      <div className="mt-6 -mx-8 overflow-auto rounded-md border border-gray-700/80 bg-black/20">
        {loading ? (
          <p className="px-8 py-6 text-sm text-gray-300">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-8 py-6 text-sm text-gray-300">No contacts found.</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-900/80">
              <tr className="text-left text-gray-200">
                <th className="border-b border-gray-700/80 px-6 py-3 w-[18%]">
                  First Name
                </th>
                <th className="border-b border-gray-700/80 px-6 py-3 w-[18%]">
                  Last Name
                </th>
                <th className="border-b border-gray-700/80 px-6 py-3 w-[34%]">
                  Email
                </th>
                <th className="border-b border-gray-700/80 px-6 py-3 w-[20%]">
                  Phone
                </th>
                <th className="border-b border-gray-700/80 px-6 py-3 w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="odd:bg-white/[0.01] hover:bg-white/[0.03]">
                  <td className="border-b border-gray-800 px-6 py-3 truncate">
                    {c.first_name}
                  </td>
                  <td className="border-b border-gray-800 px-6 py-3 truncate">
                    {c.last_name}
                  </td>
                  <td className="border-b border-gray-800 px-6 py-3 truncate">
                    {c.email || "-"}
                  </td>
                  <td className="border-b border-gray-800 px-6 py-3 truncate">
                    {c.phone || "-"}
                  </td>
                  <td className="border-b border-gray-800 px-6 py-3">
                    <Link
                      href={`/app/contacts/${c.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
