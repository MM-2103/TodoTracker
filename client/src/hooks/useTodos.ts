import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Todo, InsertTodo, UpdateTodo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type TodoFilter = "all" | "active" | "completed";

export function useTodos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all todos
  const { data: todos = [], isLoading, error } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Add new todo
  const { mutate: addTodo, isPending: isAddingTodo } = useMutation({
    mutationFn: async (newTodo: InsertTodo) => {
      const res = await apiRequest("POST", "/api/todos", newTodo);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add todo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update todo
  const { mutate: updateTodo, isPending: isUpdatingTodo } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTodo }) => {
      const res = await apiRequest("PUT", `/api/todos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update todo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle todo completion
  const { mutate: toggleTodo } = useMutation({
    mutationFn: async (todo: Todo) => {
      const res = await apiRequest("PUT", `/api/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      return res.json();
    },
    // Use optimistic updates for better UX
    onMutate: async (updatedTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/todos"] });
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["/api/todos"]) as Todo[];
      
      // Optimistically update to the new value
      queryClient.setQueryData<Todo[]>(
        ["/api/todos"],
        (old = []) => old.map(todo => 
          todo.id === updatedTodo.id 
            ? { ...todo, completed: !todo.completed } 
            : todo
        )
      );
      
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context returned to roll back
      queryClient.setQueryData(["/api/todos"], context?.previousTodos);
      toast({
        title: "Error",
        description: "Failed to update todo status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is correct
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  // Delete todo
  const { mutate: deleteTodo } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    // Use optimistic updates for better UX
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/todos"] });
      
      const previousTodos = queryClient.getQueryData(["/api/todos"]) as Todo[];
      
      queryClient.setQueryData<Todo[]>(
        ["/api/todos"],
        (old = []) => old.filter(todo => todo.id !== deletedId)
      );
      
      return { previousTodos };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["/api/todos"], context?.previousTodos);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  // Filter todos based on filter type
  const filterTodos = (todos: Todo[], filter: TodoFilter) => {
    switch (filter) {
      case "active":
        return todos.filter(todo => !todo.completed);
      case "completed":
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  };

  return {
    todos,
    isLoading,
    error,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    filterTodos,
    isAddingTodo,
    isUpdatingTodo,
  };
}
