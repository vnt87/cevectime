import type { TimesheetEntry } from '@/types';

export function exportToCSV(entries: TimesheetEntry[], filename: string = 'timesheet_export.csv'): void {
  if (!entries.length) {
    alert('No data to export.');
    return;
  }

  const headers = [
    "Date", "Logged Time", "User", "Project", 
    "Today plan", "Actual work", "Issues", 
    "Tomorrow Plan", "Free comments"
  ];

  const csvRows = [
    headers.join(','),
    ...entries.map(entry => [
      entry.date,
      entry.loggedTime,
      `"${entry.user.replace(/"/g, '""')}"`,
      `"${entry.project.replace(/"/g, '""')}"`,
      `"${entry.todayPlan.replace(/"/g, '""')}"`,
      `"${entry.actualWork.replace(/"/g, '""')}"`,
      `"${entry.issues.replace(/"/g, '""')}"`,
      `"${entry.tomorrowPlan.replace(/"/g, '""')}"`,
      `"${(entry.freeComments || '').replace(/"/g, '""')}"`,
    ].join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
