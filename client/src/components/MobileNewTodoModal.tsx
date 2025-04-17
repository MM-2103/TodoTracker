import { useState, useEffect } from "react";
import { TODO_CATEGORIES, PRIORITY_LEVELS, TodoCategory, PriorityLevel } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LightbulbIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { debounce } from "@/lib/utils";

interface MobileNewTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; category: TodoCategory; priority?: PriorityLevel }) => void;
  isSubmitting: boolean;
}

interface AnalysisResult {
  category: TodoCategory;
  priority: PriorityLevel;
  sentiment: string;
  sentiment_score: number;
}

export function MobileNewTodoModal({ isOpen, onClose, onSubmit, isSubmitting }: MobileNewTodoModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TodoCategory>("work");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCategory("work");
      setPriority("medium");
      setShowSuggestions(false);
      setAnalysisResult(null);
    }
  }, [isOpen]);

  // Fetch task suggestions
  const { data: suggestionData, isLoading: isSuggestionLoading, refetch: refetchSuggestion } = useQuery<{ suggestion: string }>({
    queryKey: ["/api/suggestions"],
    enabled: showSuggestions,
  });

  // Text analysis
  const { mutate: analyzeText } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) return null;
      setIsAnalyzing(true);
      const res = await apiRequest("POST", "/api/analyze", { text });
      return res.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      if (data) {
        setAnalysisResult(data);
        
        // Always use the AI suggestions
        setCategory(data.category);
        setPriority(data.priority);
      }
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    }
  });

  // Debounced analysis
  const debouncedAnalyze = debounce((value: string) => {
    if (value.trim().length > 3) {
      analyzeText(value);
    }
  }, 600);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    debouncedAnalyze(value);
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title, category, priority });
      setTitle("");
      setCategory("work");
      setPriority("medium");
      onClose();
    }
  };

  const handleUseSuggestion = () => {
    if (suggestionData?.suggestion) {
      setTitle(suggestionData.suggestion);
      analyzeText(suggestionData.suggestion);
      setShowSuggestions(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add New Task</DialogTitle>
        </DialogHeader>
        
        {!showSuggestions ? (
          <>
            <div className="grid gap-4 py-2">
              {/* AI Suggestion Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-gray-600 justify-center"
                onClick={() => setShowSuggestions(true)}
              >
                <LightbulbIcon className="mr-2 h-4 w-4 text-yellow-500" />
                Get AI task suggestion
              </Button>
              
              <div className="grid gap-2">
                <Label htmlFor="mobile-todo-title" className="text-left">Title</Label>
                <Input
                  id="mobile-todo-title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Enter task title"
                  disabled={isSubmitting}
                />
                
                {isAnalyzing && (
                  <div className="text-xs text-gray-500 animate-pulse">Analyzing...</div>
                )}
                
                {analysisResult && !isAnalyzing && (
                  <div className="text-xs p-2 rounded-md bg-gray-50 border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">AI suggested category: </span>
                        <span className="font-medium capitalize">{analysisResult.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Priority: </span>
                        <span className="font-medium capitalize">{analysisResult.priority}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mobile-todo-category" className="text-left">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value as TodoCategory)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="mobile-todo-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TODO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mobile-todo-priority" className="text-left">AI Priority (Auto-selected)</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as PriorityLevel)}
                  disabled={true} // Always disabled to use AI suggestion
                >
                  <SelectTrigger id="mobile-todo-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((pri) => (
                      <SelectItem key={pri} value={pri}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!title.trim() || isSubmitting}
                className="w-full sm:col-start-2"
              >
                Add Task
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-3 sm:mt-0 w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          // AI Suggestion UI
          <div className="py-4">
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <div className="flex items-start">
                <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    AI Suggestion
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {isSuggestionLoading ? (
                      <p>Generating suggestions...</p>
                    ) : (
                      <p>{suggestionData?.suggestion || "No suggestions available"}</p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestionData?.suggestion && (
                      <Button
                        size="sm"
                        onClick={handleUseSuggestion}
                        className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                      >
                        Use Suggestion
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (suggestionData?.suggestion) {
                          refetchSuggestion();
                        } else {
                          setShowSuggestions(false);
                        }
                      }}
                    >
                      {suggestionData?.suggestion ? "Get Another" : "Try Again"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
