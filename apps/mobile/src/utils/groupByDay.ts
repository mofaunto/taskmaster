import { HistoryEntry } from "@/types/history";
import { formatDate } from "@/utils/date";

export type DaySection = {
  title: string;
  data: HistoryEntry[];
};

export type DayLabels = {
  today: string;
  yesterday: string;
  locale?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayLabel(iso: string, now: Date, labels: DayLabels) {
  const date = new Date(iso);
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const daysAgo = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / DAY_MS,
  );

  if (daysAgo === 0) {
    return labels.today;
  }
  if (daysAgo === 1) {
    return labels.yesterday;
  }
  return formatDate(iso, labels.locale);
}

export function groupByDay(
  entries: HistoryEntry[],
  now = new Date(),
  labels: DayLabels = { today: "Today", yesterday: "Yesterday" },
): DaySection[] {
  const sections: DaySection[] = [];

  for (const entry of entries) {
    const title = dayLabel(entry.createdAt, now, labels);
    const last = sections[sections.length - 1];

    if (last && last.title === title) {
      last.data.push(entry);
    } else {
      sections.push({ title, data: [entry] });
    }
  }

  return sections;
}
