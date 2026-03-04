import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Used throughout the app for className management
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
