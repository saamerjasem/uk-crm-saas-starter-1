'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/contacts?ts=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`GET /api/contacts ${r.status}`);
      const j = await r.json();
      setContacts(j.contacts || []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createContact(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`POST /api/contacts ${res.status} ${t}`);
      }
      setForm({ first_name: '', last_name: '', email: '', phone: '' });
      load();
    } catch (e: any) {
      setErr(e.message || 'Failed to add contact');
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
    <div className="w-full px-8 py-6">
      <h1 className="text-3xl font-semibold mb-4">Contacts</h1>

      {err && <p className="text-red-400 mb-3">{err}</p>}

      {/* ── Section 1: Compact Add/Search (two rows max) ───────────────── */}
      <section className="max-w-2xl">
        <form onSubmit={createContact} className="space-y-2">
          {/* Row 1: inputs + button */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              placeholder="First Name"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              className="md:col-span-2 border border-gray-700/60 bg-black/20 rounded px-3 h-10"
            />
            <input
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              className="md:col-span-2 border border-gray-700/60 bg-black/20 rounded px-3 h-10"
            />
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded px-3 h-10 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>

          {/* Row 1.5: email/phone (still compact) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="md:col-span-3 border border-gray-700/60 bg-black/20 rounded px-3 h-10"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="md:col-span-2 border border-gray-700/60 bg-black/20 rounded px-3 h-10"
            />
          </div>

          {/* Row 2: single search input */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-full border border-gray-700/60 bg-black/20 rounded px-3 h-10"
          />
        </form>
      </section>

      {/* ── Section 2: Full-width bordered table ───────────────────────── */}
      <section className="mt-6 -mx-8 px-8">
        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400">No contacts found.</p>
        ) : (
          <div className="w-full overflow-auto rounded-md border border-gray-700/80 bg-black/20">
            {/* Optional: colgroup to control relative widths */}
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[32%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead className="bg-gray-900/80 sticky top-0 z-10">
                <tr className="text-left text-gray-200">
                  <th className="border-b border-gray-700/80 px-4 py-3">First Name</th>
                  <th className="border-b border-gray-700/80 px-4 py-3">Last Name</th>
                  <th className="border-b border-gray-700/80 px-4 py-3">Email</th>
                  <th className="border-b border-gray-700/80 px-4 py-3">Phone</th>
                  <th className="border-b border-gray-700/80 px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={i % 2 ? 'bg-gray-950/40' : ''}
                  >
                    <td className="border-t border-gray-800 px-4 py-3">{c.first_name}</td>
                    <td className="border-t border-gray-800 px-4 py-3">{c.last_name}</td>
                    <td className="border-t border-gray-800 px-4 py-3">
                      <span className="block truncate" title={c.email || ''}>
                        {c.email || '-'}
                      </span>
                    </td>
                    <td className="border-t border-gray-800 px-4 py-3">
                      <span className="block truncate" title={c.phone || ''}>
                        {c.phone || '-'}
                      </span>
                    </td>
                    <td className="border-t border-gray-800 px-4 py-3">
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
          </div>
        )}
      </section>
    </div>
  );
}
