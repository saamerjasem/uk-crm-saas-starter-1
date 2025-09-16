'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

export default function ContactsPage() {
  const router = useRouter();

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

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="w-full max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Contacts</h1>

      {err && <p className="text-red-400 mb-3">{err}</p>}

      {/* Create + Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          placeholder="First Name"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          className="border border-gray-700/60 bg-black/20 rounded p-2"
        />
        <input
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          className="border border-gray-700/60 bg-black/20 rounded p-2"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="border border-gray-700/60 bg-black/20 rounded p-2"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="border border-gray-700/60 bg-black/20 rounded p-2"
        />
        <button
          onClick={createContact}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded px-4 py-2 disabled:opacity-50"
          aria-label="Add contact"
        >
          {saving ? 'Saving…' : 'Add Contact'}
        </button>

        {/* Search spans full width on small screens */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email or phone"
          className="md:col-span-5 border border-gray-700/60 bg-black/20 rounded p-2 mt-1"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No contacts found.</p>
      ) : (
        <div className="relative overflow-x-auto rounded-md border border-gray-700/70 bg-black/20">
          <table className="w-full table-fixed text-sm">
            {/* Fixed column proportions so the table feels balanced */}
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '34%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>

            <thead className="bg-gray-900/70 sticky top-0 z-10">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium [&>th]:border-b [&>th]:border-gray-700/70">
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/70">
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-900/50 cursor-pointer ${
                    idx % 2 === 1 ? 'bg-gray-950/30' : ''
                  }`}
                  onClick={() => router.push(`/app/contacts/${c.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/app/contacts/${c.id}`);
                    }
                  }}
                  role="button"
                  aria-label={`Open ${c.first_name} ${c.last_name}`}
                >
                  <td className="px-4 py-3 truncate" title={c.first_name}>{c.first_name}</td>
                  <td className="px-4 py-3 truncate" title={c.last_name}>{c.last_name}</td>
                  <td className="px-4 py-3">
                    <span className="block truncate" title={c.email || ''}>
                      {c.email || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate" title={c.phone || ''}>{c.phone || '-'}</td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()} // allow link without triggering row click
                  >
                    <Link
                      href={`/app/contacts/${c.id}`}
                      className="text-blue-400 hover:underline"
                      aria-label={`Edit ${c.first_name} ${c.last_name}`}
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
    </div>
  );
}
