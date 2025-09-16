// app/app/layout.tsx
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Your left sidebar / nav stays as-is, or import it here */}
      {/* <Aside /> */}

      {/* MAIN CONTENT: note the max-w-none so it can use the whole window width */}
      <main className="flex-1 max-w-none px-8 py-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
