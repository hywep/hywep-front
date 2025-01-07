import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {colleges} from "@/lib/contants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sortedColleges = Object.fromEntries(
    Object.entries(colleges).map(([college, majors]) => [
      college,
      majors.sort((a, b) => a.localeCompare(b, "ko")),
    ])
);
