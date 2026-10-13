import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * Field Intelligence OS handles protected reporting material, so the baseline
 * is deny-by-default (`AGENTS.md`, `docs/standards/SECURITY_PRIVACY_STANDARD.md`).
 * A full Content-Security-Policy with per-request nonces belongs to Phase 01,
 * once real auth and server actions exist; these are the headers that are
 * correct and enforceable today.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Field Mode will request camera/microphone/geolocation in Phase 04.
    // Until then they are denied outright rather than left at the default.
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    // Never ship a build that does not typecheck.
    ignoreBuildErrors: false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
