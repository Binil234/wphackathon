export type ExpenseCategory = 
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'healthcare'
  | 'entertainment'
  | 'personal'
  | 'education'
  | 'debt'
  | 'savings'
  | 'gifts'
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // ISO date string
  createdAt: string; // ISO date-time string
  userId: string;
}

export interface Budget {
  id: string;
  month: string; // Format: YYYY-MM
  categories: {
    [key in ExpenseCategory]?: number;
  };
  totalBudget: number;
  userId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO date string
  targetDate: string; // ISO date string
  category?: string;
  icon?: string;
  userId: string;
}

export interface MonthlyTotal {
  month: string; // Format: YYYY-MM
  total: number;
  categories: {
    [key in ExpenseCategory]?: number;
  };
}

export interface User {
  id: string;
  email: string;
}

export interface AppState {
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  currentMonth: string; // Format: YYYY-MM
  monthlySummaries: MonthlyTotal[];
  user: User | null;
}