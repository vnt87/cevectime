import { db } from './config';
import { DEFAULT_USER_EMAIL, PROJECT_OPTIONS } from '@/config/app-config';

async function seed() {
  try {
    // Insert default user
    await db
      .insertInto('users')
      .values({
        email: DEFAULT_USER_EMAIL,
        name: DEFAULT_USER_EMAIL.split('@')[0],
      })
      .onConflict((oc) => oc.column('email').doNothing())
      .execute();

    console.log('Default user seeded successfully');

    // Insert projects
    for (const project of PROJECT_OPTIONS) {
      await db
        .insertInto('projects')
        .values({
          name: project.value,
          description: project.label,
        })
        .onConflict((oc) => oc.column('name').doNothing())
        .execute();
    }

    console.log('Projects seeded successfully');

    console.log('All seed operations completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
