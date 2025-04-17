import natural from 'natural';
import sentiment from 'sentiment';
import { TodoCategory, TODO_CATEGORIES } from '@shared/schema';

// Initialize natural language processing tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const analyzer = new sentiment();

// Sample keyword mappings for categorization
const categoryKeywords: Record<TodoCategory, string[]> = {
  work: ['meeting', 'project', 'deadline', 'report', 'client', 'presentation', 'email', 'call', 'boss', 'colleague'],
  personal: ['health', 'exercise', 'family', 'friend', 'hobby', 'home', 'self', 'life', 'doctor', 'appointment'],
  shopping: ['buy', 'purchase', 'shop', 'store', 'grocery', 'item', 'list', 'cart', 'online', 'order', 'deliver'],
  other: []
};

// Priority keywords
const priorityKeywords = {
  high: ['urgent', 'important', 'critical', 'asap', 'deadline', 'tomorrow', 'today', 'soon', 'immediately', 'emergency'],
  medium: ['next week', 'this week', 'soon', 'follow up', 'check', 'review'],
  low: ['sometime', 'when possible', 'eventually', 'later', 'consider', 'maybe', 'if time']
};

/**
 * Analyzes text to suggest the most appropriate category
 * @param text Todo text to analyze
 * @returns Suggested category
 */
export function suggestCategory(text: string): TodoCategory {
  if (!text) return 'other';
  
  const tokens = tokenizer.tokenize(text.toLowerCase());
  if (!tokens || tokens.length === 0) return 'other';
  
  // Calculate scores for each category
  const scores: Record<TodoCategory, number> = {
    work: 0,
    personal: 0,
    shopping: 0,
    other: 0
  };
  
  // Process each token
  for (const token of tokens) {
    const stemmed = stemmer.stem(token);
    
    // Check each category for matches
    for (const category of TODO_CATEGORIES) {
      const keywords = categoryKeywords[category];
      if (keywords.some(keyword => keyword.includes(token) || token.includes(keyword) || 
                       keyword.includes(stemmed) || stemmed.includes(keyword))) {
        scores[category] += 1;
      }
    }
  }
  
  // Find category with highest score
  let maxCategory: TodoCategory = 'other';
  let maxScore = 0;
  
  for (const category of TODO_CATEGORIES) {
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      maxCategory = category;
    }
  }
  
  return maxScore > 0 ? maxCategory : 'other';
}

/**
 * Analyzes text to suggest priority level
 * @param text Todo text to analyze
 * @returns Priority level (high, medium, low)
 */
export function suggestPriority(text: string): 'high' | 'medium' | 'low' {
  if (!text) return 'medium';
  
  const lowerText = text.toLowerCase();
  
  // Check for high priority keywords
  for (const keyword of priorityKeywords.high) {
    if (lowerText.includes(keyword)) {
      return 'high';
    }
  }
  
  // Check for low priority keywords
  for (const keyword of priorityKeywords.low) {
    if (lowerText.includes(keyword)) {
      return 'low';
    }
  }
  
  // Default to medium if no keywords matched
  return 'medium';
}

/**
 * Performs sentiment analysis on text
 * @param text Todo text to analyze
 * @returns Score and assessment
 */
export function analyzeSentiment(text: string): { score: number, assessment: string } {
  if (!text) return { score: 0, assessment: 'neutral' };
  
  const result = analyzer.analyze(text);
  const score = result.score;
  
  let assessment = 'neutral';
  if (score > 2) assessment = 'very positive';
  else if (score > 0) assessment = 'positive';
  else if (score < -2) assessment = 'very negative';
  else if (score < 0) assessment = 'negative';
  
  return { score, assessment };
}

/**
 * Generates task suggestions based on existing todos
 * @param existingTodos Array of todo titles
 * @returns Suggested task
 */
export function suggestTask(existingTodos: string[]): string {
  if (!existingTodos || existingTodos.length === 0) {
    return "Add your first task!";
  }
  
  // Simple suggestion logic based on patterns in existing todos
  const workRelated = existingTodos.filter(todo => 
    suggestCategory(todo) === 'work').length > 0;
  
  const personalRelated = existingTodos.filter(todo => 
    suggestCategory(todo) === 'personal').length > 0;
  
  const shoppingRelated = existingTodos.filter(todo => 
    suggestCategory(todo) === 'shopping').length > 0;
  
  if (workRelated && !existingTodos.some(t => t.includes('follow up'))) {
    return "Follow up on previous work tasks";
  }
  
  if (personalRelated && !existingTodos.some(t => t.includes('exercise'))) {
    return "Schedule exercise time";
  }
  
  if (shoppingRelated && !existingTodos.some(t => t.includes('grocery'))) {
    return "Create grocery shopping list";
  }
  
  const suggestions = [
    "Plan your next week's tasks",
    "Set a reminder for upcoming deadlines",
    "Check in with team members",
    "Review your goals for this month",
    "Organize your workspace"
  ];
  
  // Return a random suggestion
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}