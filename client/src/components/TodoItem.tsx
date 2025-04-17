import { useState } from "react";
import { Todo, TodoCategory, PriorityLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  formatDate, 
  getCategoryColor, 
  getPriorityColor,
  getSentimentColor, 
  capitalize 
} from "@/lib/utils";
import { 
  CheckIcon, 
  Pencil, 
  Save, 
  X, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const categoryColors = getCategoryColor(todo.category);
  const priorityColors = getPriorityColor(todo.priority || 'medium');
  const sentimentColors = getSentimentColor(todo.sentiment_score || 0);

  const handleUpdate = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, editTitle);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const PriorityIcon = () => {
    switch(todo.priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 mr-1 text-orange-500" />;
      case 'low':
        return <AlertCircle className="h-3 w-3 mr-1 text-green-500" />;
      default:
        return <Clock className="h-3 w-3 mr-1 text-orange-500" />;
    }
  };

  return (
    <div className={`p-4 sm:p-5 ${sentimentColors.bg} border-l-4 ${priorityColors.border}`}>
      <div className="flex items-start">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <button 
            onClick={() => onToggle(todo)} 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
              todo.completed ? "bg-primary border-primary" : "border-gray-300"
            }`}
            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {todo.completed && (
              <CheckIcon className="w-3 h-3 text-white" />
            )}
          </button>
        </div>
        
        {/* Todo Content */}
        <div className="ml-3 flex-1">
          <div className="flex flex-wrap items-center mb-1 gap-2">
            {/* Category Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
              {capitalize(todo.category as string)}
            </span>
            
            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors.bg} ${priorityColors.text}`}>
              <PriorityIcon />
              {capitalize(todo.priority as string || 'medium')}
            </span>
            
            {/* Sentiment Badge (only show if not neutral) */}
            {todo.sentiment_score && todo.sentiment_score !== 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs">
                {sentimentColors.icon}
              </span>
            )}
          </div>
            
          {/* Edit Mode Title Input */}
          {isEditing ? (
            <Input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 mt-2"
              autoFocus
            />
          ) : (
            /* Display Mode Title */
            <h3 
              className={`text-sm sm:text-base font-medium ${sentimentColors.text} ${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.title}
            </h3>
          )}
          
          <div className="text-xs text-gray-500 flex items-center mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(todo.created_at)}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="ml-3 flex-shrink-0 flex items-center space-x-1">
          {isEditing ? (
            <>
              {/* Save Button */}
              <Button
                onClick={handleUpdate}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Save className="h-4 w-4" />
              </Button>
              
              {/* Cancel Button */}
              <Button
                onClick={handleCancel}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Edit Button */}
              <Button
                onClick={() => setIsEditing(true)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-gray-400 hover:text-gray-500"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              {/* Delete Button */}
              <Button
                onClick={() => onDelete(todo.id)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
