import type { TimesheetEntry } from '@/types';

export function exportToCSV(entries: TimesheetEntry[]): void {
  if (!entries.length) {
    alert('No data to export.');
    return;
  }

  const headers = ["Date", "Logged Time", "Report", "User", "Project"];

  function sanitizeForCSV(text: string): string {
    // Keep alphanumeric chars, spaces, newlines, and common punctuation
    let sanitizedText = (text || '')
      .replace(/[^\w\s\n\r.,!?()-]/g, '') // Keep letters, numbers, spaces, newlines, and basic punctuation
      .trim();

    // Prevent spreadsheet software from interpreting text as formulas
    if (sanitizedText.length > 0 && ['=', '+', '-', '@'].includes(sanitizedText[0])) {
      sanitizedText = "'" + sanitizedText;
    }
    return sanitizedText;
  }

  function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  }

  function formatReport(entry: TimesheetEntry): string {
    const report = [
      '- Today plan',
      sanitizeForCSV(entry.todayPlan || ''),
      '',
      '- Actual work',
      sanitizeForCSV(entry.actualWork || ''),
      '',
      '- Do you have any issues?',
      sanitizeForCSV(entry.issues || ''),
      '',
      '- Tomorrow plan',
      sanitizeForCSV(entry.tomorrowPlan || ''),
      '',
      '- Free comment',
      sanitizeForCSV(entry.freeComments || ''),
      ''
    ].join('\n');

    return report.replace(/"/g, '""');
  }

  // Sort entries by date (ascending)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const csvRows = [
    headers.join(','),
    ...sortedEntries.map(entry => [
      formatDate(entry.date),
      entry.loggedTime,
      `"${formatReport(entry)}"`,
      `"${sanitizeForCSV(entry.user || '').replace(/"/g, '""')}"`,
      `"${sanitizeForCSV(entry.project || '').replace(/"/g, '""')}"`,
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
