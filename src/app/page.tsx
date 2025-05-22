
"use client";

import type * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, PlusCircle, Gift, CalendarCheck2, Briefcase, Activity, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths, isEqual, startOfDay, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimesheetForm } from '@/components/timesheet-form';
import type { TimesheetEntry } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { isWeekend, isHoliday, isPastOrToday, parseDate, formatDate, isDateDisabled } from '@/lib/date-utils';
import { exportToCSV } from '@/lib/csv-utils';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Added ThemeToggleButton

export default function HomePage() {
  const [timesheetEntries, setTimesheetEntries] = useLocalStorage<TimesheetEntry[]>('timesheetEntries', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [initialModalDate, setInitialModalDate] = useState<Date | undefined>();

  const handleSaveTimesheet = (newEntries: TimesheetEntry[]) => {
    const updatedEntries = [...timesheetEntries];
    newEntries.forEach(newEntry => {
      const existingIndex = updatedEntries.findIndex(e => e.date === newEntry.date && e.project === newEntry.project);
      if (existingIndex > -1) {
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

  const modifiers = useMemo(() => ({
    holiday: (date: Date) => isHoliday(date),
    weekend: (date: Date) => isWeekend(date),
    unloggedPastOrToday: (date: Date) => {
      const isCurrentMonthDay = isSameMonth(date, currentMonth);
      return isCurrentMonthDay &&
        isPastOrToday(date) && 
        !isWeekend(date) && 
        !isHoliday(date) && 
        !loggedDates.some(loggedDate => isEqual(loggedDate, startOfDay(date)));
    }
  }), [currentMonth, loggedDates]);

  const modifiersClassNames = {
    holiday: '!text-destructive dark:!text-red-400', 
    weekend: 'bg-diagonal-pattern', 
    unloggedPastOrToday: 'border-l-4 border-destructive/70 !rounded-none', 
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setSelectedDate(date); 
    if (date && !isDateDisabled(date)) {
      setInitialModalDate(date);
      setIsModalOpen(true);
    } else {
      setInitialModalDate(undefined); 
    }
  };

  const daysInCurrentMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const workingDaysThisMonth = useMemo(() => {
    return daysInCurrentMonth.filter(day => !isDateDisabled(day)).length;
  }, [daysInCurrentMonth]);

  const loggedDaysThisMonthCount = useMemo(() => {
    const uniqueLoggedDays = new Set(
      timesheetEntries
        .filter(entry => isSameMonth(parseDate(entry.date), currentMonth))
        .map(entry => formatDate(parseDate(entry.date)))
    );
    return uniqueLoggedDays.size;
  }, [timesheetEntries, currentMonth]);

  const daysToLogCount = useMemo(() => {
    return daysInCurrentMonth.filter(day => {
      const isPastAndInCurrentMonth = isPastOrToday(day) && isSameMonth(day, currentMonth);
      const isWorkday = !isDateDisabled(day);
      const isLoggedForThisDay = loggedDates.some(loggedDate => isEqual(loggedDate, startOfDay(day)));
      return isPastAndInCurrentMonth && isWorkday && !isLoggedForThisDay;
    }).length;
  }, [daysInCurrentMonth, loggedDates, currentMonth]);
  

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 md:px-8 pt-4 md:pt-8"> 
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo />
          <ThemeToggleButton /> {/* Moved ThemeToggleButton here */}
        </header>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working Days</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workingDaysThisMonth}</div>
              <p className="text-xs text-muted-foreground">in {format(currentMonth, 'MMMM')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logged Days</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loggedDaysThisMonthCount}</div>
               <p className="text-xs text-muted-foreground">out of {workingDaysThisMonth} working days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Logging</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysToLogCount}</div>
              <p className="text-xs text-muted-foreground">past workdays</p>
            </CardContent>
          </Card>
        </div>
         {/* Moved buttons here */}
        <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-2">
            <Button onClick={() => exportToCSV(timesheetEntries)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => { setInitialModalDate(undefined); setIsModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Log Timesheet
            </Button>
        </div>
      </div>

      <main className="pb-4 md:pb-8"> 
        <Card className="shadow-lg w-full rounded-none md:rounded-lg"> 
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 md:px-6 pt-4 md:pt-6">
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
          <CardContent className="p-0"> 
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="w-full border-t md:border md:rounded-b-lg" 
              classNames={{
                month: "space-y-4 w-full",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "text-muted-foreground flex-1 basis-0 font-normal text-[0.8rem] py-2 text-center border-b",
                row: "flex w-full border-t",
                cell: "h-28 flex-1 basis-0 text-sm p-0 relative box-border border-l first:border-l-0 last:border-r-0 md:last:border-r",
                day: cn(
                  "h-full w-full p-1 focus:relative focus:z-10 flex flex-col justify-between items-start text-left"
                ),
                day_selected: 
                  "ring-2 ring-primary ring-inset bg-primary/10 text-primary-foreground dark:text-primary",
                day_today: "bg-accent/30 text-accent-foreground font-bold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-40 line-through cursor-not-allowed",
              }}
              components={{
                DayContent: ({ date, displayMonth }) => {
                  const isCurrentMonthDay = isEqual(startOfMonth(date), startOfMonth(displayMonth));
                  const dayNumberFormatted = format(date, 'd');
                  
                  const entriesForDay = isCurrentMonthDay ? timesheetEntries.filter(entry => 
                    isEqual(startOfDay(parseDate(entry.date)), startOfDay(date))
                  ) : [];
                  const isDayLogged = entriesForDay.length > 0;
                  const isDayHoliday = isCurrentMonthDay && isHoliday(date);
                  const isPastUnloggedWorkday = 
                    isCurrentMonthDay &&
                    isPastOrToday(date) &&
                    !isWeekend(date) &&
                    !isDayHoliday &&
                    !isDayLogged;

                  return (
                    <>
                      <div 
                        className={cn(
                          "text-xs font-medium self-start",
                          !isCurrentMonthDay && 'text-muted-foreground/70'
                        )}
                      >
                        {dayNumberFormatted}
                      </div>

                      {isCurrentMonthDay && (
                        <div className="flex flex-col justify-end flex-grow w-full text-center items-center text-[0.65rem] leading-tight mt-1">
                          {isDayHoliday ? (
                            <div className="flex items-center text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-800/30 px-1 py-0.5 rounded-sm w-full justify-center">
                              <Gift className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">Holiday</span>
                            </div>
                          ) : isDayLogged ? (
                            entriesForDay.slice(0, 1).map(entry => (
                              <div key={entry.id} className="flex items-center text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-800/30 px-1 py-0.5 rounded-sm w-full justify-center">
                                <CalendarCheck2 className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate">{entry.project}</span>
                              </div>
                            ))
                          ) : isPastUnloggedWorkday ? (
                            <div className="text-muted-foreground px-1 py-0.5">
                              No logged time
                            </div>
                          ) : null}
                        </div>
                      )}
                    </>
                  );
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
        initialDate={initialModalDate}
      />
    </div>
  );
}
