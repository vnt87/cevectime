import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('email', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)')
    .addColumn('created_at', sql`timestamp with time zone`, (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();

  // Create projects table
  await db.schema
    .createTable('projects')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('created_at', sql`timestamp with time zone`, (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();

  // Create timesheet_entries table
  await db.schema
    .createTable('timesheet_entries')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('entry_date', 'date', (col) => col.notNull())
    .addColumn('logged_time', 'numeric(4, 2)', (col) => col.notNull())
    .addColumn('user_email', 'varchar(255)', (col) => 
      col.notNull().references('users.email')
    )
    .addColumn('project_id', 'uuid', (col) => 
      col.notNull().references('projects.id')
    )
    .addColumn('today_plan', 'text', (col) => col.notNull())
    .addColumn('actual_work', 'text', (col) => col.notNull())
    .addColumn('issues', 'text')
    .addColumn('tomorrow_plan', 'text', (col) => col.notNull())
    .addColumn('free_comments', 'text')
    .addColumn('created_at', sql`timestamp with time zone`, (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', sql`timestamp with time zone`, (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();

  // Add indexes
  await db.schema
    .createIndex('idx_timesheet_entries_user_email')
    .on('timesheet_entries')
    .column('user_email')
    .execute();

  await db.schema
    .createIndex('idx_timesheet_entries_entry_date')
    .on('timesheet_entries')
    .column('entry_date')
    .execute();

  await db.schema
    .createIndex('idx_timesheet_entries_project_id')
    .on('timesheet_entries')
    .column('project_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('timesheet_entries').execute();
  await db.schema.dropTable('projects').execute();
  await db.schema.dropTable('users').execute();
}
