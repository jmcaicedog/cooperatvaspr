export function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
