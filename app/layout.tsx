import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Field Intelligence OS",
    template: "%s · Field Intelligence OS",
  },
  description:
    "Plan, capture, verify, connect and publish multimodal field investigation with preserved provenance and consent.",
  /**
   * The application handles protected reporting material, so it must never be
   * indexed — not even the Phase 00 shell, which sets the precedent.
   */
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom is never disabled: pinch-zoom is an accessibility requirement, and in
  // the field it is how you read a small label in bad light.
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
