import type { TimesheetEntry } from '@/types';

export function exportToCSV(entries: TimesheetEntry[]): void {
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
      `"${(entry.user || '').replace(/"/g, '""')}"`,
      `"${(entry.project || '').replace(/"/g, '""')}"`,
      `"${(entry.todayPlan || '').replace(/"/g, '""')}"`,
      `"${(entry.actualWork || '').replace(/"/g, '""')}"`,
      `"${(entry.issues || '').replace(/"/g, '""')}"`,
      `"${(entry.tomorrowPlan || '').replace(/"/g, '""')}"`,
      `"${(entry.freeComments || '').replace(/"/g, '""')}"`,
    ].join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const now = new Date();
    const dateStr = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const filename = `cevectime_${dateStr}_timesheet.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
