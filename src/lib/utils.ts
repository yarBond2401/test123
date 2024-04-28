import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isThisYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatChatMessageTime(date: Date) {
  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isThisYear(date)) {
    return format(date, "MM/dd HH:mm");
  } else {
    return format(date, "yyyy/MM/dd HH:mm");
  }
}

export function dot(a: number[], b: number[]) {
  return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}
