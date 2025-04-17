import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { suggestCategory, suggestPriority, analyzeSentiment, suggestTask } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Todo routes
  app.get("/api/todos", async (req: Request, res: Response) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.get("/api/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const todo = await storage.getTodo(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      console.error("Error fetching todo:", error);
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  app.post("/api/todos", async (req: Request, res: Response) => {
    try {
      const result = insertTodoSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      // Apply AI enhancements if not already specified
      const todoData = { ...result.data };
      
      // Auto-categorize if category not provided or is 'other'
      if (!todoData.category || todoData.category === 'other') {
        todoData.category = suggestCategory(todoData.title);
      }
      
      // Auto-suggest priority if not provided
      if (!todoData.priority) {
        todoData.priority = suggestPriority(todoData.title);
      }
      
      // Add sentiment analysis
      const sentiment = analyzeSentiment(todoData.title);
      todoData.sentiment_score = sentiment.score;

      const newTodo = await storage.createTodo(todoData);
      res.status(201).json(newTodo);
    } catch (error) {
      console.error("Error creating todo:", error);
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  app.put("/api/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const result = updateTodoSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      // If title is being updated, recalculate AI attributes
      const updateData = { ...result.data };
      if (updateData.title) {
        // Only suggest category if not explicitly provided in update
        if (!updateData.category) {
          updateData.category = suggestCategory(updateData.title);
        }
        
        // Only suggest priority if not explicitly provided in update
        if (!updateData.priority) {
          updateData.priority = suggestPriority(updateData.title);
        }
        
        // Always update sentiment on title change
        const sentiment = analyzeSentiment(updateData.title);
        updateData.sentiment_score = sentiment.score;
      }

      const updatedTodo = await storage.updateTodo(id, updateData);
      if (!updatedTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(updatedTodo);
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteTodo(id);
      if (!success) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // AI Task Suggestion endpoint
  app.get("/api/suggestions", async (req: Request, res: Response) => {
    try {
      const todos = await storage.getTodos();
      const todoTitles = todos.map(todo => todo.title);
      const suggestion = suggestTask(todoTitles);
      
      res.json({ suggestion });
    } catch (error) {
      console.error("Error generating suggestion:", error);
      res.status(500).json({ message: "Failed to generate suggestion" });
    }
  });

  // Analyze a text without creating a todo
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const category = suggestCategory(text);
      const priority = suggestPriority(text);
      const sentiment = analyzeSentiment(text);
      
      res.json({
        category,
        priority,
        sentiment: sentiment.assessment,
        sentiment_score: sentiment.score
      });
    } catch (error) {
      console.error("Error analyzing text:", error);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
