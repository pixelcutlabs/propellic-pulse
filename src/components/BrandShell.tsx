'use client';

import { brand } from "@/lib/brand";

export default function BrandShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.bg, color: brand.text }}>
      <header className="border-b" style={{ borderColor: "rgba(21,37,52,0.15)", background: brand.bg }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <div 
              className="text-xl font-bold"
              style={{ color: brand.primary }}
            >
              {brand.name}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}