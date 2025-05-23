
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Lightbulb } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { TimesheetEntry, NagerDateHoliday } from '@/types';
import { DEFAULT_USER_EMAIL, DEFAULT_LOGGED_TIME, PROJECT_OPTIONS } from '@/config/app-config';
import { getDatesInRange, isDateDisabled, formatDate } from '@/lib/date-utils';
import { suggestTomorrowPlan } from '@/ai/flows/suggest-tomorrow-plan';
import { saveTimesheetEntries } from '@/app/api/timesheet/service';

interface TimesheetFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  initialDate?: Date;
  vietnamHolidays: NagerDateHoliday[];
  initialEntryData?: TimesheetEntry;
}

const formSchema = z.object({
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).refine(data => data.from, { message: "Start date is required." }),
  loggedTime: z.number().min(0.1, "Logged time must be greater than 0").max(24, "Logged time cannot exceed 24 hours"),
  user: z.string().min(1, "Username is required.").regex(/^[a-zA-Z0-9._-]+$/, "Invalid username format (e.g., user.name or user-name)"),
  project: z.string().min(1, "Project is required."),
  todayPlan: z.string().min(1, "Today plan is required.").max(400, "Today plan cannot exceed 400 characters."),
  actualWork: z.string().min(1, "Actual work is required.").max(400, "Actual work cannot exceed 400 characters."),
  hasIssues: z.enum(['yes', 'no']).default('no'),
  issues: z.string().max(400, "Issues description cannot exceed 400 characters.").optional(),
  tomorrowPlan: z.string().min(1, "Tomorrow plan is required.").max(400, "Tomorrow plan cannot exceed 400 characters."),
  freeComments: z.string().max(400, "Free comments cannot exceed 400 characters.").optional(),
}).refine(data => {
  if (data.hasIssues === 'yes') {
    return data.issues && data.issues.trim().length > 0;
  }
  return true;
}, {
  message: "Issues description is required when 'Yes' is selected.",
  path: ['issues'],
});

type TimesheetFormData = z.infer<typeof formSchema>;

export function TimesheetForm({ isOpen, onOpenChange, onSuccess, initialDate, vietnamHolidays, initialEntryData }: TimesheetFormProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [actualWorkManuallyEdited, setActualWorkManuallyEdited] = useState(false);

  const form = useForm<TimesheetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loggedTime: DEFAULT_LOGGED_TIME,
      user: DEFAULT_USER_EMAIL.split('@')[0],
      project: PROJECT_OPTIONS[0]?.value || '',
      todayPlan: '',
      actualWork: '',
      hasIssues: 'no',
      issues: '',
      tomorrowPlan: '',
      freeComments: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      let effectiveInitialDate = startOfDay(new Date());
      if (initialDate && !isDateDisabled(initialDate, vietnamHolidays)) {
        effectiveInitialDate = startOfDay(initialDate);
      } else if (initialDate && isDateDisabled(initialDate, vietnamHolidays)) {
         effectiveInitialDate = startOfDay(new Date());
         toast({ title: "Notice", description: "Selected date is a non-working day. Please pick a valid date.", variant: "default" });
      }

      if (initialEntryData) {
        const entryDate = startOfDay(new Date(initialEntryData.date));
        form.reset({
          dateRange: { from: entryDate, to: entryDate },
          loggedTime: initialEntryData.loggedTime,
          user: initialEntryData.user.split('@')[0],
          project: initialEntryData.project,
          todayPlan: initialEntryData.todayPlan,
          actualWork: initialEntryData.actualWork,
          hasIssues: initialEntryData.issues ? 'yes' : 'no',
          issues: initialEntryData.issues || '',
          tomorrowPlan: initialEntryData.tomorrowPlan,
          freeComments: initialEntryData.freeComments || '',
        });
        setActualWorkManuallyEdited(true); // Prevent auto-sync with todayPlan for existing entries
      } else {
        form.reset({
          dateRange: { from: effectiveInitialDate, to: effectiveInitialDate },
          loggedTime: DEFAULT_LOGGED_TIME,
          user: DEFAULT_USER_EMAIL.split('@')[0],
          project: PROJECT_OPTIONS[0]?.value || '',
          todayPlan: '',
          actualWork: '',
          hasIssues: 'no',
          issues: '',
          tomorrowPlan: '',
          freeComments: '',
        });
      }
      setDateRange({ from: effectiveInitialDate, to: effectiveInitialDate });
      setActualWorkManuallyEdited(false); // Reset flag when form opens/resets
    }
  }, [isOpen, initialDate, form, vietnamHolidays, toast]);


  useEffect(() => {
    form.setValue('dateRange', { from: dateRange?.from, to: dateRange?.to });
  }, [dateRange, form]);

  const watchedTodayPlan = form.watch('todayPlan');
  const watchedActualWork = form.watch('actualWork');
  const watchedIssues = form.watch('issues');
  const watchedTomorrowPlan = form.watch('tomorrowPlan');
  const watchedFreeComments = form.watch('freeComments');
  const watchedHasIssues = form.watch('hasIssues');

  useEffect(() => {
    if (!actualWorkManuallyEdited) {
      form.setValue('actualWork', watchedTodayPlan, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedTodayPlan, actualWorkManuallyEdited, form]);

  const { onChange: actualWorkRHFOnChange, ...restActualWorkProps } = form.register('actualWork');


  const handleSuggestTomorrowPlan = async () => {
    const { todayPlan, actualWork, issues, hasIssues } = form.getValues();
    const issuesToConsider = hasIssues === 'yes' ? issues : 'None';

    if (!todayPlan || !actualWork ) {
      toast({
        title: "Missing Information",
        description: "Please fill in 'Today plan' and 'Actual work' to get suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestTomorrowPlan({ todayPlan, actualWork, issues: issuesToConsider || 'None' });
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

  const onSubmit = async (data: TimesheetFormData) => {
    if (!data.dateRange.from) {
      toast({ title: "Error", description: "Please select a date.", variant: "destructive" });
      return;
    }

    const startDate = data.dateRange.from;
    const endDate = data.dateRange.to || startDate;
    const datesToLog = getDatesInRange(startDate, endDate).filter(d => !isDateDisabled(d, vietnamHolidays));

    if (datesToLog.length === 0) {
      toast({ title: "No Valid Dates", description: "Selected range contains no valid workdays (check for weekends/holidays).", variant: "destructive"});
      return;
    }

    const finalUserEmail = data.user.includes('@') ? data.user : `${data.user}@sun-asterisk.com`;

    try {
      const newEntries: Partial<TimesheetEntry>[] = datesToLog.map(date => ({
        date: formatDate(date),
        loggedTime: data.loggedTime,
        user: finalUserEmail,
        project: data.project,
        todayPlan: data.todayPlan,
        actualWork: data.actualWork,
        issues: data.hasIssues === 'yes' ? (data.issues || '') : '',
        tomorrowPlan: data.tomorrowPlan,
        freeComments: data.freeComments,
      }));

      const response = await saveTimesheetEntries(newEntries);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save timesheet entries');
      }

      toast({ title: "Success", description: `Logged ${newEntries.length} timesheet(s).` });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving timesheet entries:', error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : 'Failed to save timesheet entries',
        variant: "destructive"
      });
    }
  };

  const localIsDateDisabled = (date: Date) => isDateDisabled(date, vietnamHolidays);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        className="sm:max-w-lg w-[90vw] overflow-y-auto p-4 pr-6 lg:w-[30rem] lg:max-w-[30rem] lg:border-l"
        overlayClassName="lg:hidden"
      >
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
                  disabled={localIsDateDisabled}
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
            <Label htmlFor="user">Username</Label>
            <div className="flex items-center mt-1">
              <Input
                id="user"
                type="text"
                className="flex-1 min-w-0 rounded-r-none focus:z-10 relative"
                {...form.register('user')}
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-secondary text-muted-foreground text-sm h-10">
                @sun-asterisk.com
              </span>
            </div>
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
            <Textarea id="todayPlan" className="mt-1 min-h-[80px]" maxLength={400} {...form.register('todayPlan')} />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {watchedTodayPlan?.length || 0} / 400
            </div>
            {form.formState.errors.todayPlan && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.todayPlan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="actualWork">Actual Work</Label>
            <Textarea
              id="actualWork"
              className="mt-1 min-h-[80px]"
              maxLength={400}
              {...restActualWorkProps}
              onChange={(e) => {
                actualWorkRHFOnChange(e);
                setActualWorkManuallyEdited(true);
              }}
              value={watchedActualWork} // Ensure value is controlled
            />
             <div className="text-xs text-muted-foreground text-right mt-1">
              {watchedActualWork?.length || 0} / 400
            </div>
            {form.formState.errors.actualWork && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.actualWork.message}</p>
            )}
          </div>

          <div>
            <Label>Do you have any issues?</Label>
            <Controller
              name="hasIssues"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'no') {
                      form.setValue('issues', '');
                      form.clearErrors('issues');
                    }
                  }}
                  value={field.value}
                  className="flex space-x-4 mt-1 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasIssues-yes" />
                    <Label htmlFor="hasIssues-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasIssues-no" />
                    <Label htmlFor="hasIssues-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {watchedHasIssues === 'yes' && (
            <div>
              <Label htmlFor="issues">Issues Description</Label>
              <Textarea
                id="issues"
                className="mt-1 min-h-[80px]"
                maxLength={400}
                {...form.register('issues')}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {watchedIssues?.length || 0} / 400
              </div>
              {form.formState.errors.issues && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.issues.message}</p>
              )}
            </div>
          )}


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
            <Textarea id="tomorrowPlan" className="mt-1 min-h-[80px]" maxLength={400} {...form.register('tomorrowPlan')} />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {watchedTomorrowPlan?.length || 0} / 400
            </div>
            {form.formState.errors.tomorrowPlan && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.tomorrowPlan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="freeComments">Free Comments (Optional)</Label>
            <Textarea id="freeComments" className="mt-1 min-h-[80px]" maxLength={400} {...form.register('freeComments')} />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {watchedFreeComments?.length || 0} / 400
            </div>
             {form.formState.errors.freeComments && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.freeComments.message}</p>
            )}
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
