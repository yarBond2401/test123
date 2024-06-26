import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isThisYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatChatMessageTime(date: Date) {
  if (isToday(date)) {
    return format(date, "h:mm" + "aaa");
  } else if (isThisYear(date)) {
    return format(date, "MM/dd h:mm aaa");
  } else {
    return format(date, "yyyy/MM/dd h:mm aaa");
  }
}

export function dot(a: number[], b: number[]) {
  return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}
