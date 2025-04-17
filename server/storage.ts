import { todos, users, type Todo, type InsertTodo, type UpdateTodo, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo operations
  getTodos(): Promise<Todo[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
}

// SQLite Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Todo operations
  async getTodos(): Promise<Todo[]> {
    return await db.select().from(todos).orderBy(desc(todos.created_at));
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const result = await db.select().from(todos).where(eq(todos.id, id));
    return result[0];
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const result = await db.insert(todos).values(insertTodo).returning();
    return result[0];
  }

  async updateTodo(id: number, updateData: UpdateTodo): Promise<Todo | undefined> {
    const result = await db.update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();
    
    return result[0];
  }

  async deleteTodo(id: number): Promise<boolean> {
    const result = await db.delete(todos).where(eq(todos.id, id)).returning();
    return result.length > 0;
  }
}

// In-Memory Storage Implementation (for fallback/testing)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private todosMap: Map<number, Todo>;
  private userCurrentId: number;
  private todoCurrentId: number;

  constructor() {
    this.users = new Map();
    this.todosMap = new Map();
    this.userCurrentId = 1;
    this.todoCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Todo operations
  async getTodos(): Promise<Todo[]> {
    return Array.from(this.todosMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    return this.todosMap.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.todoCurrentId++;
    const now = new Date();
    const todo: Todo = {
      ...insertTodo,
      id,
      created_at: now,
      completed: insertTodo.completed || false,
      category: insertTodo.category || 'work',
      priority: insertTodo.priority || 'medium',
      sentiment_score: insertTodo.sentiment_score || 0
    };
    this.todosMap.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, updateData: UpdateTodo): Promise<Todo | undefined> {
    const todo = this.todosMap.get(id);
    if (!todo) return undefined;

    const updatedTodo: Todo = {
      ...todo,
      ...updateData
    };
    
    this.todosMap.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todosMap.delete(id);
  }
}

// Use the database storage
export const storage = new DatabaseStorage();
