// Single source of truth for the public site URL.
//
// Used for canonical tags, Open Graph / Twitter metadata, JSON-LD, the sitemap
// and robots.txt. Centralising it here prevents the different files from
// drifting apart (they previously fell back to three different URLs).
//
// Override per-environment with NEXT_PUBLIC_SITE_URL — set this in Vercel to the
// current production deployment URL. The fallback below is used only when the
// env var is missing, so it must always point at a live deployment.
const FALLBACK_SITE_URL = 'https://duplomna-website-p786.vercel.app'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
).replace(/\/$/, '')
