import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="card">Loading…</div>
      </main>
    }>
      <LoginClient />
    </Suspense>
  );
}
