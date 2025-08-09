import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Propellic Pulse | Employee Net Promoter Score Survey",
  description: "Anonymous monthly eNPS surveys to measure employee satisfaction and engagement at Propellic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
        style={{
          // Use system fonts for now
          ["--font-heading" as any]: "system-ui, -apple-system, sans-serif",
          ["--font-body" as any]: "system-ui, -apple-system, sans-serif",
        }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
