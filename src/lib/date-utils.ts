
import { addDays, format, parseISO, isWeekend as dfnsIsWeekend, eachDayOfInterval, isEqual, startOfDay } from 'date-fns';
import type { NagerDateHoliday } from '@/types'; // Import NagerDateHoliday type

export function isWeekend(date: Date): boolean {
  return dfnsIsWeekend(date);
}

export function isHoliday(date: Date, holidayList: NagerDateHoliday[] = []): boolean {
  if (!holidayList || holidayList.length === 0) return false;
  const dateString = format(date, 'yyyy-MM-dd');
  return holidayList.some(h => h.date === dateString);
}

export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  if (!startDate || !endDate) return [];
  return eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });
}

export function formatDate(date: Date, fmt: string = 'yyyy-MM-dd'): string {
  return format(date, fmt);
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

export function isPastOrToday(date: Date): boolean {
  return startOfDay(date) <= startOfDay(new Date());
}

export function isDateDisabled(date: Date, holidayList: NagerDateHoliday[] = []): boolean {
  return isWeekend(date) || isHoliday(date, holidayList);
}
