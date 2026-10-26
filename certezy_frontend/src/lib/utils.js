import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Tailwind class merger utility
 *
 * shadcn/ui ka default helper.
 * Conflicting Tailwind classes ko smartly merge karta hai.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-primary", className)
 *   cn("text-sm", error && "text-red-500")
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
