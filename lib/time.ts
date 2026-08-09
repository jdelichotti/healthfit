export const APP_TIME_ZONE = "America/Argentina/Buenos_Aires";

export function dayKey(date: Date, timeZone: string = APP_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDayLabel(
  key: string,
  timeZone: string = APP_TIME_ZONE
): string {
  const date = new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat("es-AR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatTime(date: Date, timeZone: string = APP_TIME_ZONE): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toLocalDateTimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function lastNDayKeys(n: number, timeZone: string = APP_TIME_ZONE): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000), timeZone));
  }
  return keys;
}
