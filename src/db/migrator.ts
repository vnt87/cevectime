import { promises as fs } from 'fs';
import path from 'path';
import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { db } from './config';

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(process.cwd(), 'src', 'db', 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to migrate:');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
