import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      <div className="main">
        <header className="header">
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <strong>Demo Ltd</strong>
            <span className="badge">London</span>
          </div>
          <div className="nav">
            <a href="/login">Sign out</a>
          </div>
        </header>
        <div className="container">{children}</div>
      </div>
    </div>
  );
}
