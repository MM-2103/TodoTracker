import { db } from './db';
import { todos, users } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Function to initialize database
async function migrateDatabase() {
  console.log('Creating database tables if they do not exist...');
  
  // Create todos table
  db.run(sql`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'work',
      priority TEXT DEFAULT 'medium',
      sentiment_score INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  
  // Create users table
  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
  
  console.log('Database migration completed successfully!');
}

// Execute migration
migrateDatabase().catch(err => {
  console.error('Database migration failed:', err);
  process.exit(1);
});