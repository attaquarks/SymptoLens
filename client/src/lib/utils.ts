import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getConfidenceLevel(confidence: number): "high" | "moderate" | "low" {
  if (confidence >= 70) return "high";
  if (confidence >= 50) return "moderate";
  return "low";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return "bg-primary";
  if (confidence >= 50) return "bg-secondary";
  return "bg-neutral-400";
}

export function getConfidenceTextClass(confidence: number): string {
  if (confidence >= 70) return "bg-primary-light text-white";
  if (confidence >= 50) return "bg-secondary text-white";
  return "bg-neutral-400 text-white";
}

export function getConfidenceText(confidence: number): string {
  if (confidence >= 70) return `High Match (${formatPercentage(confidence)})`;
  if (confidence >= 50) return `Moderate Match (${formatPercentage(confidence)})`;
  return `Lower Match (${formatPercentage(confidence)})`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
