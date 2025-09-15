"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/contacts", label: "Contacts" },
  { href: "/app/deals", label: "Deals" },
  { href: "/app/companies", label: "Companies" },
  { href: "/app/activities", label: "Activities" },
  { href: "/app/quotes", label: "Quotes" },
  { href: "/app/settings", label: "Settings" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="nav" style={{ justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700 }}>UK CRM</div>
        <span className="badge">Beta</span>
      </div>
      <div style={{ height: 12 }} />
      <nav className="grid">
        {items.map(i => {
          const active = pathname === i.href || pathname.startsWith(i.href + "/");
          return (
            <Link key={i.href} href={i.href} style={{
              padding: ".6rem .8rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: active ? "rgba(79,70,229,.15)" : "transparent"
            }}>
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ position: "absolute", bottom: 16, left: 16, color: "var(--muted)", fontSize: 12 }}>
        <span className="kbd">⌘</span> + <span className="kbd">K</span> Command menu soon
      </div>
    </aside>
  );
}
