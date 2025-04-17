import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const TODO_CATEGORIES = ["work", "personal", "shopping", "other"] as const;
export const PRIORITY_LEVELS = ["high", "medium", "low"] as const;

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  category: text("category").notNull().default("work"),
  priority: text("priority").default("medium"),
  sentiment_score: integer("sentiment_score").default(0),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertTodoSchema = createInsertSchema(todos).pick({
  title: true,
  completed: true,
  category: true,
  priority: true,
  sentiment_score: true,
}).extend({
  category: z.enum(TODO_CATEGORIES),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  sentiment_score: z.number().optional(),
});

export const updateTodoSchema = createInsertSchema(todos).pick({
  title: true,
  completed: true,
  category: true,
  priority: true,
  sentiment_score: true,
}).partial().extend({
  category: z.enum(TODO_CATEGORIES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  sentiment_score: z.number().optional(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TodoCategory = typeof TODO_CATEGORIES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[number];
