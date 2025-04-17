import { useState } from "react";
import { useTodos, TodoFilter } from "@/hooks/useTodos";
import { InsertTodo, TodoCategory, PriorityLevel } from "@shared/schema";
import { TodoList } from "@/components/TodoList";
import { TodoFilters } from "@/components/TodoFilters";
import { NewTodoForm } from "@/components/NewTodoForm";
import { MobileNewTodoModal } from "@/components/MobileNewTodoModal";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";

export default function Home() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [showMobileModal, setShowMobileModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const { 
    todos, 
    isLoading, 
    error, 
    addTodo, 
    updateTodo, 
    toggleTodo, 
    deleteTodo, 
    filterTodos,
    isAddingTodo,
  } = useTodos();

  const filteredTodos = filterTodos(todos, filter);
  
  const handleAddTodo = (data: { title: string; category: TodoCategory; priority?: PriorityLevel }) => {
    const newTodo: InsertTodo = {
      title: data.title,
      category: data.category,
      completed: false,
      priority: data.priority || 'medium',
    };
    addTodo(newTodo);
  };
  
  const handleUpdateTodo = (id: number, title: string) => {
    updateTodo({ id, data: { title } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-800">Smart TodoList</h1>
            </div>
            <div className="hidden sm:block">
              <TodoFilters 
                currentFilter={filter} 
                onFilterChange={setFilter} 
              />
            </div>
          </div>
          
          {/* Mobile Filters */}
          <div className="sm:hidden pb-4">
            <TodoFilters 
              currentFilter={filter} 
              onFilterChange={setFilter} 
              isMobile={true}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Todo Input - Desktop only */}
        <div className="hidden sm:block">
          <NewTodoForm 
            onSubmit={handleAddTodo} 
            isSubmitting={isAddingTodo} 
          />
        </div>

        {/* Todo List */}
        <TodoList 
          todos={todos}
          filteredTodos={filteredTodos}
          isLoading={isLoading}
          error={error as Error | null}
          currentFilter={filter}
          onToggle={toggleTodo}
          onUpdate={handleUpdateTodo}
          onDelete={deleteTodo}
          onRetry={() => {
            // Trigger a refetch by invalidating the query
            window.location.reload();
          }}
        />
      </main>

      {/* Todo Status Bar */}
      {!isLoading && !error && todos.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-primary shadow-lg sm:p-3">
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-primary-dark">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </span>
                  <p className="ml-3 font-medium text-white truncate">
                    <span className="md:hidden">
                      {todos.filter(t => t.completed).length}/{todos.length} completed
                    </span>
                    <span className="hidden md:inline">
                      {todos.filter(t => t.completed).length} of {todos.length} tasks completed
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo FAB (Mobile) */}
      {isMobile && (
        <div className="sm:hidden fixed bottom-16 right-4">
          <Button
            onClick={() => setShowMobileModal(true)}
            className="h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile New Todo Modal */}
      <MobileNewTodoModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onSubmit={handleAddTodo}
        isSubmitting={isAddingTodo}
      />
    </div>
  );
}
