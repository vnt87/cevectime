import type { TimesheetEntry } from '@/types';

interface APIResponse<T> {
  success: boolean;
  error?: string;
  results?: T[];
  entries?: T[];
}

export async function saveTimesheetEntries(entries: Partial<TimesheetEntry>[]): Promise<APIResponse<TimesheetEntry>> {
  const response = await fetch('/api/timesheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entries),
  });

  return response.json();
}

export async function getTimesheetEntries(params: {
  user: string;
  startDate?: string;
  endDate?: string;
}): Promise<APIResponse<TimesheetEntry>> {
  const searchParams = new URLSearchParams();
  searchParams.append('user', params.user);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);

  const response = await fetch(`/api/timesheet?${searchParams.toString()}`);
  return response.json();
}
