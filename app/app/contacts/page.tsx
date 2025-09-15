'use client';

import { useEffect, useState } from 'react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  async function fetchContacts() {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add contact');
      }

      setForm({ first_name: '', last_name: '', email: '', phone: '' });
      fetchContacts(); // refresh list after adding
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">No contacts found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg shadow-sm mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border-b">First Name</th>
              <th className="text-left p-2 border-b">Last Name</th>
              <th className="text-left p-2 border-b">Email</th>
              <th className="text-left p-2 border-b">Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.first_name}</td>
                <td className="p-2">{c.last_name}</td>
                <td className="p-2">{c.email || '-'}</td>
                <td className="p-2">{c.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAddContact} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="border rounded p-2"
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Contact'}
        </button>
      </form>
    </div>
  );
}
