import { ColumnType, Generated } from 'kysely';

export interface Database {
  users: UserTable;
  projects: ProjectTable;
  timesheet_entries: TimesheetEntryTable;
}

export interface UserTable {
  email: string;
  name: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface ProjectTable {
  id: Generated<string>; // UUID
  name: string;
  description: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface TimesheetEntryTable {
  id: Generated<string>; // UUID
  entry_date: ColumnType<Date, string, string>;
  logged_time: number;
  user_email: string;
  project_id: string;
  today_plan: string;
  actual_work: string;
  issues: string | null;
  tomorrow_plan: string;
  free_comments: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}
