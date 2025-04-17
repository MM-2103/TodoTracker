import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

export function getCategoryColor(category: string) {
  switch (category) {
    case 'work':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'personal':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'shopping':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'other':
      return { bg: 'bg-purple-100', text: 'text-purple-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
    case 'medium':
      return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }
}

export function getSentimentColor(score: number) {
  if (score > 2) return { bg: 'bg-green-50', text: 'text-green-700', icon: '😃' };
  if (score > 0) return { bg: 'bg-green-50', text: 'text-green-600', icon: '🙂' };
  if (score < -2) return { bg: 'bg-red-50', text: 'text-red-700', icon: '😞' };
  if (score < 0) return { bg: 'bg-red-50', text: 'text-red-600', icon: '😐' };
  return { bg: 'bg-gray-50', text: 'text-gray-600', icon: '😐' };
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
