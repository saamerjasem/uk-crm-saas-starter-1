'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Contact = { id:string; first_name:string; last_name:string; email:string|null; phone:string|null };

export default function ContactsPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'' });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/contacts?ts=${Date.now()}`, { cache:'no-store' });
      if (!r.ok) throw new Error(`GET /api/contacts ${r.status}`);
      const j = await r.json();
      setContacts(j.contacts || []);
    } catch (e:any) {
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
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`POST /api/contacts ${res.status} ${t}`);
      }
      setForm({ first_name:'', last_name:'', email:'', phone:'' });
      load();
    } catch (e:any) {
      setErr(e.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter(c =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [q, contacts]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        {/* Search */}
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search name, email or phone"
          className="border rounded p-2 w-full max-w-md"
        />
      </div>

      {err && <p className="text-red-400 mb-3">{err}</p>}

      {/* Create form, one row */}
      <form onSubmit={createContact} className="grid gap-3 mb-6"
            style={{ gridTemplateColumns:'1fr 1fr 1fr 1fr auto' }}>
        <input placeholder="First Name" value={form.first_name}
               onChange={e=>setForm(f=>({...f, first_name: e.target.value}))} className="border rounded p-2"/>
        <input placeholder="Last Name" value={form.last_name}
               onChange={e=>setForm(f=>({...f, last_name: e.target.value}))} className="border rounded p-2"/>
        <input placeholder="Email" type="email" value={form.email}
               onChange={e=>setForm(f=>({...f, email: e.target.value}))} className="border rounded p-2"/>
        <input placeholder="Phone" value={form.phone}
               onChange={e=>setForm(f=>({...f, phone: e.target.value}))} className="border rounded p-2"/>
        <button className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
                disabled={saving}>
          {saving ? 'Saving…' : 'Add Contact'}
        </button>
      </form>

      {/* Responsive table */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No contacts found.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-700">
          <table className="min-w-[720px] w-full table-fixed border-separate border-spacing-0">
            {/* Proportional widths that scale with window */}
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '38%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>

            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-3 py-2">First Name</th>
                <th className="text-left px-3 py-2">Last Name</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Phone</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-800 hover:bg-gray-900 cursor-pointer"
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
                  <td className="px-3 py-2 whitespace-nowrap truncate" title={c.first_name}>
                    {c.first_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap truncate" title={c.last_name}>
                    {c.last_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="block truncate" title={c.email || ''}>
                      {c.email || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap truncate" title={c.phone || ''}>
                    {c.phone || '-'}
                  </td>
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()} // keep row click, allow link click
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
