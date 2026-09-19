export function nowIso() {
  return new Date().toISOString();
}

export function formatDate(iso: string, locale?: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string, locale?: string) {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string, locale?: string) {
  return `${formatDate(iso, locale)}, ${formatTime(iso, locale)}`;
}
