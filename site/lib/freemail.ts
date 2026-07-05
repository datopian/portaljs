// Free/consumer email providers. The /build front door is for organizations
// (gov / ngo / enterprise / smb); individuals on free mail are steered to the terminal path
// instead (npm create portaljs@latest + skills — same capability, no gate). See po-76p.
//
// Kept in sync with cloud/auth/src/email.ts FREE_EMAIL_DOMAINS — the auth worker enforces the
// same list server-side as a backstop. Two build roots, so no shared import.
export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'ymail.com', 'rocketmail.com',
  'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'aol.com', 'gmx.com', 'gmx.net', 'mail.com', 'yandex.com', 'yandex.ru',
  'zoho.com', 'tutanota.com', 'fastmail.com', 'hey.com', 'inbox.com', 'hushmail.com',
])

// Extract the lowercased domain from an email address, or '' if it has none.
export function emailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase().trim() ?? ''
}

// Pragmatic email check — mirror of the worker's isValidEmail. Enough to reject obvious junk.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

// True when the address is a known free/consumer provider (call after isValidEmail).
export function isFreeEmailDomain(email: string): boolean {
  const domain = emailDomain(email)
  return !!domain && FREE_EMAIL_DOMAINS.has(domain)
}

// Best-effort organization name inferred from a corporate email domain, used to prefill the
// (editable) organization field. "data.gov.au" → "Data", "cityofmalmo.se" → "Cityofmalmo".
// Deliberately simple: strips the TLD/second-level public suffixes and title-cases the label.
export function orgFromEmail(email: string): string {
  const domain = emailDomain(email)
  if (!domain || isFreeEmailDomain(email)) return ''
  const parts = domain.split('.')
  // Drop trailing public-suffix-ish labels (tld + common second-level like co.uk, gov.au).
  const SECOND_LEVEL = new Set(['co', 'com', 'org', 'gov', 'net', 'ac', 'edu'])
  let end = parts.length - 1 // drop the TLD
  if (end > 0 && SECOND_LEVEL.has(parts[end - 1])) end -= 1
  const label = parts[Math.max(0, end - 1)] || parts[0]
  return label.charAt(0).toUpperCase() + label.slice(1)
}
