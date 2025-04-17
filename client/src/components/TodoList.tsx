import { Todo } from "@shared/schema";
import { TodoItem } from "./TodoItem";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ClipboardList } from "lucide-react";
import { TodoFilter } from "@/hooks/useTodos";

interface TodoListProps {
  todos: Todo[];
  filteredTodos: Todo[];
  isLoading: boolean;
  error: Error | null;
  currentFilter: TodoFilter;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  onRetry: () => void;
}

export function TodoList({ 
  todos,
  filteredTodos, 
  isLoading, 
  error, 
  currentFilter,
  onToggle, 
  onUpdate, 
  onDelete, 
  onRetry 
}: TodoListProps) {

  // Loading State
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-md bg-white shadow-sm p-4 flex items-center">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="mt-2 h-3 w-1/2 rounded" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading your todos</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || "Something went wrong"}</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={onRetry} 
                type="button" 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">
          {currentFilter === "all" && "Get started by creating a new task."}
          {currentFilter === "active" && "No active tasks found."}
          {currentFilter === "completed" && "No completed tasks found."}
        </p>
      </div>
    );
  }

  // Todo List
  return (
    <div className="space-y-3">
      {filteredTodos.map((todo) => (
        <div 
          key={todo.id}
          className={`relative bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${
            todo.completed ? 'opacity-70' : ''
          }`}
        >
          <TodoItem 
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
