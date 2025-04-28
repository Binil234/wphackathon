import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AppState, 
  Budget, 
  Expense, 
  ExpenseCategory, 
  SavingsGoal,
  User 
} from '../types';
import { 
  getCurrentMonth, 
  getLastSixMonthsSummary, 
  loadState, 
  saveState 
} from '../utils/helpers';
import { supabase } from '../lib/supabase';

// Default initial state
const initialState: AppState = {
  expenses: [],
  budgets: [],
  savingsGoals: [],
  currentMonth: getCurrentMonth(),
  monthlySummaries: [],
  user: null,
};

// Context type definition
interface AppContextType {
  state: AppState;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateBudget: (budget: Omit<Budget, 'userId'>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSavingsAmount: (id: string, amount: number) => void;
  setCurrentMonth: (month: string) => void;
}

// Create the context
const AppContext = createContext<AppContextType>({
  state: initialState,
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {},
  updateBudget: () => {},
  addSavingsGoal: () => {},
  updateSavingsGoal: () => {},
  deleteSavingsGoal: () => {},
  updateSavingsAmount: () => {},
  setCurrentMonth: () => {},
});

// Context provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedState = loadState();
    return savedState || initialState;
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setState(prevState => ({
          ...prevState,
          user: {
            id: session.user.id,
            email: session.user.email || '',
          },
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          user: null,
          expenses: [],
          budgets: [],
          savingsGoals: [],
          monthlySummaries: [],
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update monthly summaries whenever expenses change
  useEffect(() => {
    const summaries = getLastSixMonthsSummary(state.expenses);
    setState(prevState => ({
      ...prevState,
      monthlySummaries: summaries,
    }));
  }, [state.expenses]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    if (!state.user) return;

    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      userId: state.user.id,
    };

    const { error } = await supabase
      .from('expenses')
      .insert(newExpense);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        expenses: [newExpense, ...prevState.expenses],
      }));
    }
  };

  // Update an existing expense
  const updateExpense = async (expense: Expense) => {
    if (!state.user) return;

    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', expense.id)
      .eq('userId', state.user.id);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        expenses: prevState.expenses.map(e => 
          e.id === expense.id ? expense : e
        ),
      }));
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    if (!state.user) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('userId', state.user.id);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        expenses: prevState.expenses.filter(e => e.id !== id),
      }));
    }
  };

  // Update budget
  const updateBudget = async (budget: Omit<Budget, 'userId'>) => {
    if (!state.user) return;

    const budgetWithUser = {
      ...budget,
      userId: state.user.id,
    };

    // First check if a budget exists for this month
    const { data: existingBudget } = await supabase
      .from('budgets')
      .select()
      .eq('userId', state.user.id)
      .eq('month', budget.month)
      .single();

    let error;
    
    if (existingBudget) {
      // If budget exists, update it
      const { error: updateError } = await supabase
        .from('budgets')
        .update(budgetWithUser)
        .eq('id', existingBudget.id)
        .eq('userId', state.user.id);
      error = updateError;
    } else {
      // If budget doesn't exist, insert new one
      const { error: insertError } = await supabase
        .from('budgets')
        .insert(budgetWithUser);
      error = insertError;
    }

    if (!error) {
      setState(prevState => {
        const existingIndex = prevState.budgets.findIndex(b => b.month === budget.month);
        
        if (existingIndex >= 0) {
          const updatedBudgets = [...prevState.budgets];
          updatedBudgets[existingIndex] = budgetWithUser;
          return { ...prevState, budgets: updatedBudgets };
        } else {
          return { ...prevState, budgets: [...prevState.budgets, budgetWithUser] };
        }
      });
    }
  };

  // Add a new savings goal
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'userId'>) => {
    if (!state.user) return;

    const newGoal: SavingsGoal = {
      ...goal,
      id: uuidv4(),
      userId: state.user.id,
    };

    const { error } = await supabase
      .from('savings_goals')
      .insert(newGoal);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        savingsGoals: [...prevState.savingsGoals, newGoal],
      }));
    }
  };

  // Update an existing savings goal
  const updateSavingsGoal = async (goal: SavingsGoal) => {
    if (!state.user) return;

    const { error } = await supabase
      .from('savings_goals')
      .update(goal)
      .eq('id', goal.id)
      .eq('userId', state.user.id);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        savingsGoals: prevState.savingsGoals.map(g => 
          g.id === goal.id ? goal : g
        ),
      }));
    }
  };

  // Delete a savings goal
  const deleteSavingsGoal = async (id: string) => {
    if (!state.user) return;

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('userId', state.user.id);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        savingsGoals: prevState.savingsGoals.filter(g => g.id !== id),
      }));
    }
  };

  // Update the amount saved for a goal
  const updateSavingsAmount = async (id: string, amount: number) => {
    if (!state.user) return;

    const goal = state.savingsGoals.find(g => g.id === id);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      currentAmount: amount,
    };

    const { error } = await supabase
      .from('savings_goals')
      .update(updatedGoal)
      .eq('id', id)
      .eq('userId', state.user.id);

    if (!error) {
      setState(prevState => ({
        ...prevState,
        savingsGoals: prevState.savingsGoals.map(goal => 
          goal.id === id 
            ? { ...goal, currentAmount: amount } 
            : goal
        ),
      }));
    }
  };

  // Set the current month
  const setCurrentMonth = (month: string) => {
    setState(prevState => ({
      ...prevState,
      currentMonth: month,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addExpense,
        updateExpense,
        deleteExpense,
        updateBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        updateSavingsAmount,
        setCurrentMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);