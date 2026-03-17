import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

export function formatNumber(value: number) {
  return value.toLocaleString("pt-BR")
}

export function formatPercent(value: number | undefined | null, decimals = 2): string {
  if (value == null) return "-"
  return `${Number(value).toFixed(decimals)}%`
}

export function formatOptionalNumber(value: number | undefined | null): string {
  if (value == null) return "-"
  return formatNumber(value)
}
