import { format, parse, startOfMonth } from 'date-fns';
import { 
  AppState, 
  Budget, 
  Expense, 
  ExpenseCategory, 
  MonthlyTotal, 
  SavingsGoal 
} from '../types';

// Format currency amount
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string, formatStr = 'MMM d, yyyy'): string => {
  const date = new Date(dateString);
  return format(date, formatStr);
};

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

// Parse month to display format
export const parseMonth = (monthStr: string): string => {
  const date = parse(monthStr, 'yyyy-MM', new Date());
  return format(date, 'MMMM yyyy');
};

// Filter expenses by month
export const filterExpensesByMonth = (expenses: Expense[], month: string): Expense[] => {
  return expenses.filter(expense => expense.date.startsWith(month));
};

// Calculate total expenses for a month
export const calculateMonthlyTotal = (expenses: Expense[], month: string): number => {
  return filterExpensesByMonth(expenses, month).reduce((total, expense) => total + expense.amount, 0);
};

// Calculate expenses by category for a month
export const calculateExpensesByCategory = (expenses: Expense[], month: string): Record<ExpenseCategory, number> => {
  const result: Partial<Record<ExpenseCategory, number>> = {};
  
  filterExpensesByMonth(expenses, month).forEach(expense => {
    if (!result[expense.category]) {
      result[expense.category] = 0;
    }
    result[expense.category]! += expense.amount;
  });
  
  return result as Record<ExpenseCategory, number>;
};

// Get budget for current month, create if doesn't exist
export const getCurrentBudget = (budgets: Budget[], currentMonth: string): Budget => {
  const existingBudget = budgets.find(b => b.month === currentMonth);
  
  if (existingBudget) {
    return existingBudget;
  }
  
  // Create a default budget
  return {
    id: crypto.randomUUID(),
    month: currentMonth,
    categories: {},
    totalBudget: 0,
  };
};

// Calculate budget progress
export const calculateBudgetProgress = (budget: Budget, expenses: Expense[]): number => {
  const monthlyTotal = calculateMonthlyTotal(expenses, budget.month);
  return budget.totalBudget > 0 ? (monthlyTotal / budget.totalBudget) * 100 : 0;
};

// Calculate category budget progress
export const calculateCategoryBudgetProgress = (
  budget: Budget, 
  expenses: Expense[], 
  category: ExpenseCategory
): number => {
  const categoryBudget = budget.categories[category] || 0;
  const categoryExpenses = filterExpensesByMonth(expenses, budget.month)
    .filter(e => e.category === category)
    .reduce((total, expense) => total + expense.amount, 0);
  
  return categoryBudget > 0 ? (categoryExpenses / categoryBudget) * 100 : 0;
};

// Calculate savings goal progress
export const calculateSavingsProgress = (goal: SavingsGoal): number => {
  return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
};

// Get monthly summaries
export const getLastSixMonthsSummary = (expenses: Expense[]): MonthlyTotal[] => {
  const result: MonthlyTotal[] = [];
  const currentDate = new Date();
  
  // Get last 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    const monthStr = format(date, 'yyyy-MM');
    
    const monthlyExpenses = filterExpensesByMonth(expenses, monthStr);
    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const categories: Partial<Record<ExpenseCategory, number>> = {};
    monthlyExpenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category]! += expense.amount;
    });
    
    result.push({
      month: monthStr,
      total,
      categories: categories as Record<ExpenseCategory, number>,
    });
  }
  
  return result.reverse();
};

// Get pretty name for category
export const getPrettyCategoryName = (category: ExpenseCategory): string => {
  const categoryMap: Record<ExpenseCategory, string> = {
    housing: 'Housing',
    transportation: 'Transportation',
    food: 'Food & Dining',
    utilities: 'Utilities',
    insurance: 'Insurance',
    healthcare: 'Healthcare',
    entertainment: 'Entertainment',
    personal: 'Personal',
    education: 'Education',
    debt: 'Debt Payments',
    savings: 'Savings',
    gifts: 'Gifts & Donations',
    other: 'Other',
  };
  
  return categoryMap[category] || category;
};

// Get available categories
export const getCategories = (): ExpenseCategory[] => {
  return [
    'housing',
    'transportation',
    'food',
    'utilities',
    'insurance',
    'healthcare',
    'entertainment',
    'personal',
    'education',
    'debt',
    'savings',
    'gifts',
    'other',
  ];
};

// Get category colors for charts
export const getCategoryColors = (): Record<ExpenseCategory, string> => {
  return {
    housing: '#0D9488', // Primary color
    transportation: '#8B5CF6', // Secondary color
    food: '#22c55e', // Success color
    utilities: '#f59e0b', // Warning color
    healthcare: '#ef4444', // Error color
    insurance: '#3b82f6',
    entertainment: '#ec4899',
    personal: '#8b5cf6',
    education: '#14b8a6',
    debt: '#f43f5e',
    savings: '#06b6d4',
    gifts: '#a855f7',
    other: '#6b7280',
  };
};

// Save state to localStorage
export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem('budgetTrackerState', JSON.stringify(state));
  } catch (err) {
    console.error('Could not save state', err);
  }
};

// Load state from localStorage
export const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem('budgetTrackerState');
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Could not load state', err);
    return undefined;
  }
};