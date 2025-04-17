import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTodoSchema, TODO_CATEGORIES, PRIORITY_LEVELS, TodoCategory, PriorityLevel } from "@shared/schema";
import { debounce } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { TextAnalysis } from "./TextAnalysis";
import { TaskSuggestions } from "./TaskSuggestions";

interface NewTodoFormProps {
  onSubmit: (values: { title: string; category: TodoCategory; priority?: PriorityLevel }) => void;
  isSubmitting: boolean;
}

interface AnalysisResult {
  category: TodoCategory;
  priority: PriorityLevel;
  sentiment: string;
  sentiment_score: number;
}

export function NewTodoForm({ onSubmit, isSubmitting }: NewTodoFormProps) {
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const form = useForm({
    resolver: zodResolver(insertTodoSchema.pick({ 
      title: true, 
      category: true,
      priority: true 
    })),
    defaultValues: {
      title: "",
      category: "work" as TodoCategory,
      priority: "medium" as PriorityLevel
    },
  });

  const debouncedTitleChange = debounce((value: string) => {
    setDebouncedTitle(value);
    // Here you could save to localStorage or do any other persistence
  }, 500);

  const handleSubmit = (values: { title: string; category: TodoCategory; priority?: PriorityLevel }) => {
    // If AI analysis was performed, add those values as defaults
    const enrichedValues = { 
      ...values,
      // Only use AI values if the user didn't explicitly select values
      category: values.category || analysis?.category || "work",
      priority: values.priority || analysis?.priority || "medium"
    };
    
    onSubmit(enrichedValues);
    form.reset({ title: "", category: "work", priority: "medium" });
    setAnalysis(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysis(result);
    
    // Always update the form with AI suggestions
    form.setValue("category", result.category);
    form.setValue("priority", result.priority);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    form.setValue("title", suggestion);
  };

  return (
    <>
      <TaskSuggestions onSelectSuggestion={handleSuggestionSelect} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mb-2">
          <div className="relative">
            <div className="flex shadow-sm rounded-md">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a new task..."
                        className="rounded-l-md border-gray-300 pr-16 py-3 flex-1"
                        onChange={(e) => {
                          field.onChange(e);
                          debouncedTitleChange(e.target.value);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="mt-2 text-sm" />
                  </FormItem>
                )}
              />
              
              {/* Category Select */}
              <div className="absolute inset-y-0 right-16 flex items-center">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md focus:ring-primary-light focus:border-primary-light w-[100px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TODO_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="rounded-r-md"
                disabled={isSubmitting}
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Dynamic Priority Select */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">AI Priority:</span>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={true} // Always disabled to use AI suggestion
                  >
                    <FormControl>
                      <SelectTrigger className="h-7 w-28 py-0 border-gray-300 text-gray-700 text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <span className="text-xs text-gray-500 ml-2">
              * AI will help categorize and prioritize your tasks
            </span>
          </div>
        </form>
      </Form>
      
      {/* Real-time analysis as user types */}
      <TextAnalysis 
        text={form.watch("title")} 
        onAnalysisComplete={handleAnalysisComplete} 
      />
    </>
  );
}
