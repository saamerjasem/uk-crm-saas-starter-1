export default function Home() {
  return (
    <main>
      <h1>UK CRM, multi tenant starter</h1>
      <p>Use the API endpoints to create contacts and deals, add a domain for your tenant, then call the API on that host.</p>
      <ul>
        <li><code>POST /api/contacts</code> with JSON <code>{`{ "first_name": "Ada", "last_name": "Lovelace", "email": "ada@example.com" }`}</code></li>
        <li><code>GET /api/contacts</code></li>
        <li><code>POST /api/deals</code> with JSON <code>{`{ "title": "Website redesign", "value": 1200 }`}</code></li>
        <li><code>GET /api/deals</code></li>
      </ul>
    </main>
  );
}
