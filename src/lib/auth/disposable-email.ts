/**
 * Server-side guard against disposable / temporary email providers.
 *
 * This runs on the server during registration, so it cannot be bypassed from
 * the browser. The list covers the most common throwaway-mail services; it is
 * not exhaustive, but it stops the overwhelming majority of temp-mail signups.
 */

const DISPOSABLE_DOMAINS = new Set<string>([
  "0clock.com",
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemail.net",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "spam4.me",
  "harakirimail.com",
  "inboxbear.com",
  "inboxkitten.com",
  "mailcatch.com",
  "maildrop.cc",
  "maileater.com",
  "mailinator.com",
  "mailinator.net",
  "mailnesia.com",
  "mailsac.com",
  "mailtemp.net",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "mvrht.net",
  "nada.email",
  "nwytg.net",
  "oneoffemail.com",
  "owlymail.com",
  "spambox.us",
  "spamgourmet.com",
  "tempail.com",
  "tempinbox.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmailo.com",
  "tempmail.net",
  "tempr.email",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "trbvm.com",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "dispostable.com",
  "discard.email",
  "discardmail.com",
  "emailtemporanea.net",
  "fakemailgenerator.com",
  "luxusmail.org",
  "mailpoof.com",
  "minuteinbox.com",
  "mytemp.email",
  "smailpro.com",
  "vomoto.com",
  "wegwerfmail.de",
  "burnermail.io",
]);

/**
 * Returns the lowercased domain portion of an email address, or null if the
 * address has no parseable domain.
 */
export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

/**
 * True if the email belongs to a known disposable provider. Matches the exact
 * domain as well as any subdomain of a blocked domain (e.g. x.mailinator.com).
 */
export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  for (const blocked of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}
