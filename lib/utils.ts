import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'EUR', locale: string = 'fr-LU'): string {
  if (price === undefined || price === null || isNaN(price)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function formatDate(date: string | number | Date | null | undefined, locale: string = 'fr-LU'): string {
  if (!date) return '—';
  
  try {
    const d = new Date(date);
    // Verifica se é uma data válida
    if (isNaN(d.getTime())) return '—';

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch (error) {
    console.warn("Invalid date passed to formatDate:", date);
    return '—';
  }
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[A-Z]/)) strength += 25;
  if (password.match(/[0-9]/)) strength += 25;
  if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
  return strength;
};