'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Contact = { id:string; first_name:string; last_name:string; email:string|null; phone:string|null };

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/contacts/${id}?ts=${Date.now()}`, { cache:'no-store' });
      if (r.status === 404) { setErr('Contact not found'); setContact(null); return; }
      if (!r.ok) throw new Error(`GET ${r.status}`);
      const j = await r.json();
      setContact(j.contact);
    } catch (e:any) {
      setErr(e.message || 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;
    try {
      setSaving(true);
      setErr(null);
      const r = await fetch(`/api/contacts/${id}`, {
        method:'PUT',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone
        })
      });
      if (!r.ok) throw new Error(`PUT ${r.status}`);
      router.push('/app/contacts');
    } catch (e:any) {
      setErr(e.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this contact')) return;
    await fetch(`/api/contacts/${id}`, { method:'DELETE' });
    router.push('/app/contacts');
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-400">{err}</div>;
  if (!contact) return <div className="p-6">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Edit contact</h1>
      <form onSubmit={save} className="grid gap-3">
        <input className="border rounded p-2"
               value={contact.first_name}
               onChange={e=>setContact({...contact, first_name: e.target.value})}
               placeholder="First Name" />
        <input className="border rounded p-2"
               value={contact.last_name}
               onChange={e=>setContact({...contact, last_name: e.target.value})}
               placeholder="Last Name" />
        <input className="border rounded p-2"
               type="email"
               value={contact.email || ''}
               onChange={e=>setContact({...contact, email: e.target.value })}
               placeholder="Email" />
        <input className="border rounded p-2"
               value={contact.phone || ''}
               onChange={e=>setContact({...contact, phone: e.target.value })}
               placeholder="Phone" />
        {err && <p className="text-red-400">{err}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={remove} className="bg-red-600 text-white px-4 py-2 rounded">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
