import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { join } from 'path';
import { sql } from 'drizzle-orm';

// Use a file path for the SQLite database
const sqlite = new Database(join(process.cwd(), 'todo_app.db'));

// Create database instance
export const db = drizzle(sqlite, { schema });

// Initialize database tables if they don't exist
function initializeDatabase() {
  console.log('Initializing database tables...');
  
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
  
  console.log('Database initialization completed successfully!');
}

// Run initialization
initializeDatabase();