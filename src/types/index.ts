export interface TimesheetEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  loggedTime: number;
  user: string;
  project: string;
  todayPlan: string;
  actualWork: string;
  issues: string;
  tomorrowPlan: string;
  freeComments?: string;
}

export interface ProjectOption {
  value: string;
  label: string;
}
