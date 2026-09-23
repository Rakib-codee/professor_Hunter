/** mailto: URL with RFC 6068 percent-encoding (spaces as %20, newlines as %0A). */
export function buildMailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
