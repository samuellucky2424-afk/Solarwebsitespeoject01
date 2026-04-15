export function sanitizeEmailHeaderValue(value: unknown, maxLength = 200): string {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmailHtmlText(value: unknown, maxLength = 5000): string {
  return sanitizeEmailHeaderValue(value, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeEmailHtmlList(
  values: unknown,
  maxItems = 20,
  maxLength = 120
): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => sanitizeEmailHtmlText(value, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}
