import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LightbulbIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

export function TaskSuggestions({ onSelectSuggestion }: TaskSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a key to force refetch
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch task suggestions from the AI service
  const { data, isLoading, error, refetch } = useQuery<{ suggestion: string }>({
    queryKey: ["/api/suggestions", refreshKey], // Include refreshKey in queryKey
    enabled: showSuggestions, // Only fetch when suggestions are shown
  });

  // Show an error toast if the suggestion fetch fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Suggestion Error",
        description: "Failed to load task suggestions",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSuggestionClick = () => {
    if (data?.suggestion) {
      onSelectSuggestion(data.suggestion);
      setShowSuggestions(false);
    }
  };

  const handleGetAnother = async () => {
    if (data?.suggestion) {
      // Invalidate the cache for the suggestions endpoint
      await queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      // Increment the refresh key to force a refetch with a new query key
      setRefreshKey(prev => prev + 1);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="mb-4">
      {!showSuggestions ? (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center text-gray-600"
          onClick={() => setShowSuggestions(true)}
        >
          <LightbulbIcon className="mr-2 h-4 w-4 text-yellow-500" />
          Get AI task suggestions
        </Button>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <div className="flex items-start">
            <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                AI Suggestion
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                {isLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <p>Generating suggestions...</p>
                  </div>
                ) : error ? (
                  <p>Failed to generate suggestions. Try again.</p>
                ) : (
                  <p>{data?.suggestion}</p>
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                {data?.suggestion && !isLoading && (
                  <Button
                    size="sm"
                    onClick={handleSuggestionClick}
                    className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                  >
                    Use Suggestion
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGetAnother}
                  disabled={isLoading}
                >
                  {data?.suggestion ? "Get Another" : "Cancel"}
                </Button>
                {data?.suggestion && !isLoading && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSuggestions(false)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}