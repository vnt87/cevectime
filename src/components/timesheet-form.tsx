"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Lightbulb } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { TimesheetEntry, ProjectOption } from '@/types';
import { DEFAULT_USER_EMAIL, DEFAULT_LOGGED_TIME, PROJECT_OPTIONS } from '@/config/app-config';
import { getDatesInRange, isDateDisabled, formatDate } from '@/lib/date-utils';
import { suggestTomorrowPlan } from '@/ai/flows/suggest-tomorrow-plan';

interface TimesheetFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (newEntries: TimesheetEntry[]) => void;
  existingEntries: TimesheetEntry[];
}

const formSchema = z.object({
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).refine(data => data.from, { message: "Start date is required." }),
  loggedTime: z.number().min(0.1, "Logged time must be greater than 0").max(24, "Logged time cannot exceed 24 hours"),
  user: z.string().email("Invalid email address."),
  project: z.string().min(1, "Project is required."),
  todayPlan: z.string().min(1, "Today plan is required."),
  actualWork: z.string().min(1, "Actual work is required."),
  issues: z.string().min(1, "Issues are required."),
  tomorrowPlan: z.string().min(1, "Tomorrow plan is required."),
  freeComments: z.string().optional(),
});

type TimesheetFormData = z.infer<typeof formSchema>;

export function TimesheetForm({ isOpen, onOpenChange, onSave, existingEntries }: TimesheetFormProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: startOfDay(new Date()),
  });
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<TimesheetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loggedTime: DEFAULT_LOGGED_TIME,
      user: DEFAULT_USER_EMAIL,
      project: PROJECT_OPTIONS[0]?.value || '',
      todayPlan: '',
      actualWork: '',
      issues: '',
      tomorrowPlan: '',
      freeComments: '',
    },
  });

  useEffect(() => {
    form.setValue('dateRange', { from: dateRange?.from, to: dateRange?.to });
  }, [dateRange, form]);

  useEffect(() => {
    if(isOpen) {
        form.reset({
            dateRange: { from: startOfDay(new Date()), to: startOfDay(new Date())},
            loggedTime: DEFAULT_LOGGED_TIME,
            user: DEFAULT_USER_EMAIL,
            project: PROJECT_OPTIONS[0]?.value || '',
            todayPlan: '',
            actualWork: '',
            issues: '',
            tomorrowPlan: '',
            freeComments: '',
        });
        setDateRange({ from: startOfDay(new Date()), to: startOfDay(new Date())});
    }
  }, [isOpen, form]);


  const handleSuggestTomorrowPlan = async () => {
    const { todayPlan, actualWork, issues } = form.getValues();
    if (!todayPlan || !actualWork || !issues) {
      toast({
        title: "Missing Information",
        description: "Please fill in 'Today plan', 'Actual work', and 'Issues' to get suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestTomorrowPlan({ todayPlan, actualWork, issues });
      form.setValue('tomorrowPlan', result.tomorrowPlanSuggestion);
      toast({
        title: "Suggestion Ready",
        description: "Tomorrow's plan has been updated with AI suggestion.",
      });
    } catch (error) {
      console.error("Error suggesting tomorrow plan:", error);
      toast({
        title: "Suggestion Failed",
        description: "Could not generate AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = (data: TimesheetFormData) => {
    if (!data.dateRange.from) {
      toast({ title: "Error", description: "Please select a date.", variant: "destructive" });
      return;
    }

    const startDate = data.dateRange.from;
    const endDate = data.dateRange.to || startDate;
    const datesToLog = getDatesInRange(startDate, endDate).filter(d => !isDateDisabled(d));

    if (datesToLog.length === 0) {
      toast({ title: "No Valid Dates", description: "Selected range contains no valid workdays.", variant: "destructive"});
      return;
    }
    
    const newEntries: TimesheetEntry[] = datesToLog.map(date => ({
      id: `${formatDate(date)}-${data.project}-${Math.random().toString(36).substr(2, 9)}`,
      date: formatDate(date),
      loggedTime: data.loggedTime,
      user: data.user,
      project: data.project,
      todayPlan: data.todayPlan,
      actualWork: data.actualWork,
      issues: data.issues,
      tomorrowPlan: data.tomorrowPlan,
      freeComments: data.freeComments,
    }));

    onSave(newEntries);
    toast({ title: "Success", description: `Logged ${newEntries.length} timesheet(s).` });
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-4 pr-6">
        <SheetHeader className="mb-4">
          <SheetTitle>Log Timesheet</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={isDateDisabled}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dateRange?.from && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.dateRange.from.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="loggedTime">Logged Time (hours)</Label>
            <Input
              id="loggedTime"
              type="number"
              step="0.1"
              className="mt-1"
              {...form.register('loggedTime', { valueAsNumber: true })}
            />
            {form.formState.errors.loggedTime && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedTime.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="user">User</Label>
            <Input id="user" type="email" className="mt-1" {...form.register('user')} />
            {form.formState.errors.user && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.user.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="project">Project</Label>
            <Controller
              name="project"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="project" className="w-full mt-1">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.project && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.project.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="todayPlan">Today Plan</Label>
            <Textarea id="todayPlan" className="mt-1 min-h-[80px]" {...form.register('todayPlan')} />
            {form.formState.errors.todayPlan && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.todayPlan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="actualWork">Actual Work</Label>
            <Textarea id="actualWork" className="mt-1 min-h-[80px]" {...form.register('actualWork')} />
            {form.formState.errors.actualWork && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.actualWork.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="issues">Do you have any issues?</Label>
            <Textarea id="issues" className="mt-1 min-h-[80px]" {...form.register('issues')} />
            {form.formState.errors.issues && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.issues.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
                <Label htmlFor="tomorrowPlan">Tomorrow Plan</Label>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSuggestTomorrowPlan} 
                    disabled={isSuggesting}
                    className="text-xs"
                >
                    {isSuggesting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Lightbulb className="mr-2 h-3 w-3" />}
                    Suggest
                </Button>
            </div>
            <Textarea id="tomorrowPlan" className="mt-1 min-h-[80px]" {...form.register('tomorrowPlan')} />
            {form.formState.errors.tomorrowPlan && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.tomorrowPlan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="freeComments">Free Comments (Optional)</Label>
            <Textarea id="freeComments" className="mt-1 min-h-[80px]" {...form.register('freeComments')} />
          </div>
          
          <SheetFooter className="pt-4">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={form.formState.isSubmitting || isSuggesting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Timesheet
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
