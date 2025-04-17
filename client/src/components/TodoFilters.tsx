import { cn } from "@/lib/utils";
import { TodoFilter } from "@/hooks/useTodos";

interface TodoFiltersProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  className?: string;
  isMobile?: boolean;
}

export function TodoFilters({ 
  currentFilter, 
  onFilterChange, 
  className, 
  isMobile = false 
}: TodoFiltersProps) {
  const filters: { label: string; value: TodoFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" }
  ];

  if (isMobile) {
    return (
      <div className={cn("flex space-x-1 w-full", className)}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-1 transition-colors",
              currentFilter === filter.value 
                ? "bg-primary text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-md shadow-sm", className)} role="group">
      {filters.map((filter, index) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors",
            currentFilter === filter.value 
              ? "bg-primary text-white" 
              : "bg-white text-gray-700 hover:bg-gray-50",
            index === 0 && "rounded-l-md",
            index === filters.length - 1 && "rounded-r-md", 
            index !== 0 && index !== filters.length - 1 && "border-l-0 border-r-0" 
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
