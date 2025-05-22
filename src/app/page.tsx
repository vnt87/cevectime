"use client";

import type * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIconLucide, ChevronLeft, ChevronRight, Download, PlusCircle } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths, isEqual, startOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimesheetForm } from '@/components/timesheet-form';
import type { TimesheetEntry } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { isWeekend, isHoliday, isPastOrToday, isDateDisabled, parseDate, formatDate } from '@/lib/date-utils';
import { exportToCSV } from '@/lib/csv-utils';
import { Logo } from '@/components/logo';

export default function HomePage() {
  const [timesheetEntries, setTimesheetEntries] = useLocalStorage<TimesheetEntry[]>('timesheetEntries', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const handleSaveTimesheet = (newEntries: TimesheetEntry[]) => {
    // Filter out any entries that might already exist for the same date and project to avoid duplicates (simple check)
    const updatedEntries = [...timesheetEntries];
    newEntries.forEach(newEntry => {
      const existingIndex = updatedEntries.findIndex(e => e.date === newEntry.date && e.project === newEntry.project);
      if (existingIndex > -1) {
        // Replace if exists (or decide on other logic, e.g., alert user)
        updatedEntries[existingIndex] = newEntry;
      } else {
        updatedEntries.push(newEntry);
      }
    });
    setTimesheetEntries(updatedEntries.sort((a,b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()));
  };

  const loggedDates = useMemo(() => 
    timesheetEntries.map(entry => startOfDay(parseDate(entry.date))), 
    [timesheetEntries]
  );

  const modifiers = {
    logged: loggedDates,
    holiday: (date: Date) => isHoliday(date),
    weekend: (date: Date) => isWeekend(date),
    unloggedPastOrToday: (date: Date) => 
      isPastOrToday(date) && 
      !isWeekend(date) && 
      !isHoliday(date) && 
      !loggedDates.some(loggedDate => isEqual(loggedDate, startOfDay(date))),
    disabled: (date: Date) => isDateDisabled(date),
  };

  const modifiersClassNames = {
    logged: 'bg-green-200 dark:bg-green-700 rounded-md text-green-900 dark:text-green-100 font-semibold',
    holiday: 'text-destructive line-through opacity-70',
    weekend: 'text-muted-foreground opacity-70',
    unloggedPastOrToday: 'bg-destructive/20 dark:bg-destructive/30 rounded-md text-destructive dark:text-red-400',
    today: 'border-2 border-primary rounded-md',
    disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
  };
  
  // Ensure selected styling takes precedence
  const todayStyle = {
    border: '2px solid hsl(var(--primary))',
    borderRadius: 'var(--radius)',
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Logo />
        <div className="flex gap-2">
          <Button onClick={() => exportToCSV(timesheetEntries)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Log Timesheet
          </Button>
        </div>
      </header>

      <main>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-2 md:p-4">
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="w-full p-3 rounded-md border"
              classNames={{
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
                day_today: 'font-bold text-primary',
              }}
              components={{
                DayContent: ({ date, displayMonth }) => {
                  if (!isEqual(startOfMonth(date), startOfMonth(displayMonth))) {
                    return <div className="text-muted-foreground/50">{format(date, 'd')}</div>;
                  }
                  return <div>{format(date, 'd')}</div>;
                },
              }}
              showOutsideDays
            />
          </CardContent>
        </Card>
      </main>

      <TimesheetForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveTimesheet}
        existingEntries={timesheetEntries}
      />
    </div>
  );
}
