import { NextResponse } from 'next/server';
import { db } from '@/db/config';
import { TimesheetEntry } from '@/types';
import { sql } from 'kysely';

export async function POST(request: Request) {
  try {
    const entries: Partial<TimesheetEntry>[] = await request.json();
    const results = [];

    for (const entry of entries) {
      // Validate required fields
      if (!entry.date || !entry.loggedTime || !entry.user || !entry.project || 
          !entry.todayPlan || !entry.actualWork || !entry.tomorrowPlan) {
        throw new Error('Missing required fields in entry');
      }

      // Get project_id from project name
      const project = await db
        .selectFrom('projects')
        .select('id')
        .where('name', '=', entry.project)
        .executeTakeFirst();

      if (!project) {
        throw new Error(`Project not found: ${entry.project}`);
      }

      // Insert timesheet entry
      const result = await db
        .insertInto('timesheet_entries')
        .values({
          entry_date: entry.date,
          logged_time: entry.loggedTime,
          user_email: entry.user,
          project_id: project.id,
          today_plan: entry.todayPlan,
          actual_work: entry.actualWork,
          issues: entry.issues || null,
          tomorrow_plan: entry.tomorrowPlan,
          free_comments: entry.freeComments || null,
        } as const) // Tell TypeScript this object has all required properties
        .returning(['id', 'entry_date'])
        .executeTakeFirst();

      if (result) {
        results.push(result);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error saving timesheet entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save timesheet entries' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    let query = db
      .selectFrom('timesheet_entries as te')
      .innerJoin('projects as p', 'te.project_id', 'p.id')
      .select([
        'te.id',
        'te.entry_date as date',
        'te.logged_time as loggedTime',
        'te.user_email as user',
        'p.name as project',
        'te.today_plan as todayPlan',
        'te.actual_work as actualWork',
        'te.issues',
        'te.tomorrow_plan as tomorrowPlan',
        'te.free_comments as freeComments',
      ])
      .where('te.user_email', '=', userEmail);

    if (startDate) {
      const parsedStartDate = new Date(startDate);
      query = query.where('te.entry_date', '>=', parsedStartDate);
    }
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      query = query.where('te.entry_date', '<=', parsedEndDate);
    }

    const entries = await query
      .orderBy('te.entry_date', 'desc')
      .execute();

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timesheet entries' },
      { status: 500 }
    );
  }
}
