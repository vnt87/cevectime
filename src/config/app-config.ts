import type { ProjectOption } from '@/types';

export const DEFAULT_USER_EMAIL = "vu.nam@sun-asterisk.com";
export const DEFAULT_LOGGED_TIME = 8;

export const PROJECT_OPTIONS: ProjectOption[] = [
  { value: "Swift Medical", label: "Swift Medical" },
  { value: "Empathetic AI", label: "Empathetic AI" },
  { value: "NowCorp", label: "NowCorp" },
];

// Define holidays as YYYY-MM-DD strings
export const HOLIDAYS: string[] = [
  "2024-01-01", // New Year's Day
  "2024-12-25", // Christmas Day
  "2025-01-01", 
  "2025-12-25",
  // Add more holidays as needed
];
