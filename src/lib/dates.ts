const MOSCOW_TIMEZONE = "Europe/Moscow";

export const parseDateToTimestamp = (value?: string | null): number => {
  if (!value) return 0;
  if (value.toLowerCase() === "pinned") return Number.MAX_SAFE_INTEGER;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getYearLabel = (rawDate?: string): string | null => {
  if (!rawDate) return null;
  if (rawDate.toLowerCase() === "pinned") return "Pinned";

  const parsed = new Date(rawDate);
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getFullYear());
  }

  const fallback = rawDate.match(/^\d{4}/);
  return fallback?.[0] ?? null;
};

export const formatDate = (rawDate?: string, withTime = true): string => {
  if (!rawDate) return "n/a";
  if (rawDate.toLowerCase() === "pinned") return "Pinned";
  if (/^\d{4}$/.test(rawDate)) return rawDate;

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit"
        }
      : {}),
    timeZone: MOSCOW_TIMEZONE
  }).format(parsed);
};

export const formatRelativeTime = (createdAtIso: string, now = Date.now()): string => {
  const createdAtMs = new Date(createdAtIso).getTime();
  const deltaSeconds = Math.max(0, Math.floor((now - createdAtMs) / 1000));

  if (deltaSeconds < 60) return "только что";

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (deltaSeconds < hour) {
    const amount = Math.floor(deltaSeconds / minute);
    return `${amount} ${plural(amount, ["минута", "минуты", "минут"])} назад`;
  }

  if (deltaSeconds < day) {
    const amount = Math.floor(deltaSeconds / hour);
    return `${amount} ${plural(amount, ["час", "часа", "часов"])} назад`;
  }

  if (deltaSeconds < month) {
    const amount = Math.floor(deltaSeconds / day);
    return `${amount} ${plural(amount, ["день", "дня", "дней"])} назад`;
  }

  if (deltaSeconds < year) {
    const amount = Math.floor(deltaSeconds / month);
    return `${amount} ${plural(amount, ["месяц", "месяца", "месяцев"])} назад`;
  }

  const amount = Math.floor(deltaSeconds / year);
  return `${amount} ${plural(amount, ["год", "года", "лет"])} назад`;
};

export const formatAbsoluteMoscowTime = (value: string): string =>
  `${new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value))} МСК`;

function plural(amount: number, forms: [string, string, string]): string {
  const mod10 = amount % 10;
  const mod100 = amount % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
