import { Prisma } from "@prisma/client";

export function toAmount(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date = new Date()) {
  const day = startOfDay(date);
  const weekday = day.getDay();
  day.setDate(day.getDate() - weekday);
  return day;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function previousPeriod(start: Date, end: Date) {
  const length = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() - length),
    end: start,
  };
}
