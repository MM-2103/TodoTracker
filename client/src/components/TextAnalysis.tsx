import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { debounce } from "@/lib/utils";
import { PriorityLevel, TodoCategory } from "@shared/schema";
import { AlertTriangle, Clock, AlertCircle, Info } from "lucide-react";

interface TextAnalysisResult {
  category: TodoCategory;
  priority: PriorityLevel;
  sentiment: string;
  sentiment_score: number;
}

interface TextAnalysisProps {
  text: string;
  onAnalysisComplete?: (result: TextAnalysisResult) => void;
}

export function TextAnalysis({ text, onAnalysisComplete }: TextAnalysisProps) {
  const [result, setResult] = useState<TextAnalysisResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { mutate: analyzeText, isPending } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) return null;
      const res = await apiRequest("POST", "/api/analyze", { text });
      return res.json() as Promise<TextAnalysisResult>;
    },
    onSuccess: (data) => {
      if (data) {
        setResult(data);
        if (onAnalysisComplete) onAnalysisComplete(data);
        setIsVisible(true);
      }
    },
  });

  // Debounced analysis function to avoid too many API calls
  const debouncedAnalyze = debounce((value: string) => {
    if (value.trim().length > 3) {
      analyzeText(value);
    } else {
      setIsVisible(false);
    }
  }, 600);

  useEffect(() => {
    debouncedAnalyze(text);
  }, [text]);

  const PriorityIcon = () => {
    if (!result) return null;
    
    switch(result.priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 mr-1 text-orange-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 mr-1 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-orange-500" />;
    }
  };

  if (!isVisible || !result) return null;

  return (
    <div className="mt-2 text-xs p-2 rounded-md bg-gray-50 border border-gray-200">
      <div className="flex items-center text-gray-600 mb-1">
        <Info className="h-3 w-3 mr-1" />
        <span>AI Analysis</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">Category:</span>
          <span className="font-medium text-gray-700 capitalize">{result.category}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">Priority:</span>
          <span className="font-medium text-gray-700 flex items-center capitalize">
            <PriorityIcon />
            {result.priority}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">Sentiment:</span>
          <span className="font-medium text-gray-700 capitalize">{result.sentiment}</span>
        </div>
      </div>
    </div>
  );
}