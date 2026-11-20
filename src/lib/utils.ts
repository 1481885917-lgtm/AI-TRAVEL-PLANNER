import { clsx, type ClassValue } from "clsx";
import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tripDates(departDate: string, returnDate: string) {
  return eachDayOfInterval({
    start: parseISO(departDate),
    end: parseISO(returnDate)
  }).map((date) => format(date, "yyyy-MM-dd"));
}

export function tripNights(departDate: string, returnDate: string) {
  return Math.max(1, differenceInCalendarDays(parseISO(returnDate), parseISO(departDate)));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}

export function splitCities(value?: string) {
  return (value ?? "")
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
