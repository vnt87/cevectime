
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

// Interface for the holiday data from Nager.Date API
export interface NagerDateHoliday {
  date: string; // "YYYY-MM-DD"
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}
