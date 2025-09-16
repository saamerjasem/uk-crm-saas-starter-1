'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/contacts?ts=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`GET /api/contacts ${r.status}`);
      const j = await r.json();
      setContacts(j.contacts ?? []);
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
      setShowAdd(false);
      load();
    } catch (e: any) {
      setErr(e.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [contacts, query]);

  return (
    <div className="w-full px-8 py-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold">Contacts</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            aria-label="Search contacts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-full md:w-80 h-10 rounded border border-gray-700/70 bg-black/20 px-3"
          />
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="h-10 whitespace-nowrap rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-white"
          >
            {showAdd ? 'Close' : 'Add Contact'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {err && (
        <div className="mt-4 rounded border border-red-700/60 bg-red-900/20 px-4 py-3 text-red-200">
          {err}
        </div>
      )}

      {/* Add form (collapsible) */}
      {showAdd && (
        <form
          onSubmit={createContact}
          className="mt-4 rounded-md border border-gray-700/80 bg-black/20 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">First Name</label>
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="h-10 rounded border border-gray-700/60 bg-black/20 px-3"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Last Name</label>
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="h-10 rounded border border-gray-700/60 bg-black/20 px-3"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@company.com"
                className="h-10 rounded border border-gray-700/60 bg-black/20 px-3"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 07800 000000"
                className="h-10 rounded border border-gray-700/60 bg-black/20 px-3"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="h-10 rounded border border-gray-700/70 bg-black/30 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Contact'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="mt-6 -mx-8 overflow-auto rounded-md border border-gray-700/80 bg-black/20">
        {loading ? (
          <p className="px-8 py-6">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="px-8 py-10 text-gray-400">
            No contacts found. Try a different search or add a new contact.
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            {/* control relative widths */}
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[36%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
            </colgroup>

            <thead className="sticky top-0 z-10 bg-gray-900/80">
              <tr className="text-left text-gray-200">
                <th className="border-b border-gray-700/80 px-6 py-3">First Name</th>
                <th className="border-b border-gray-700/80 px-6 py-3">Last Name</th>
                <th className="border-b border-gray-700/80 px-6 py-3">Email</th>
                <th className="border-b border-gray-700/80 px-6 py-3">Phone</th>
                <th className="border-b border-gray-700/80 px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={i % 2 ? 'bg-gray-950/40' : ''}>
                  <td className="border-t border-gray-800 px-6 py-3">{c.first_name}</td>
                  <td className="border-t border-gray-800 px-6 py-3">{c.last_name}</td>
                  <td className="border-t border-gray-800 px-6 py-3">
                    <span className="block truncate" title={c.email ?? ''}>
                      {c.email ?? '-'}
                    </span>
                  </td>
                  <td className="border-t border-gray-800 px-6 py-3">
                    <span className="block truncate" title={c.phone ?? ''}>
                      {c.phone ?? '-'}
                    </span>
                  </td>
                  <td className="border-t border-gray-800 px-6 py-3">
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
