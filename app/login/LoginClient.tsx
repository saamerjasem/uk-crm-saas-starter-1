"use client";

import { setSessionCookie } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const next = useSearchParams().get("next") || "/app";

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSessionCookie();            // placeholder, swap for real auth later
    router.push(next);
  }

  return (
    <main className="container" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: 420 }}>
        <h1 style={{ marginTop: 0 }}>Welcome back</h1>
        <p className="muted">Sign in to continue to your CRM.</p>
        <form onSubmit={handleLogin} className="grid">
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@company.co.uk"
            required
          />
          <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p style={{ color: "var(--muted)", marginTop: ".75rem" }}>
          No password for now, we will add real authentication later.
        </p>
      </div>
    </main>
  );
}
