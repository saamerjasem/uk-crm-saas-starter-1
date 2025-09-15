export default function Home() {
  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>UK CRM, multi tenant starter</h1>
        <p className="muted">Log in to open your workspace.</p>
        <a href="/login"><button>Go to login</button></a>
      </div>
    </main>
  );
}
