import React, { useState } from 'react';
import { 
  ArrowRight, 
  Edit, 
  Pencil, 
  Plus, 
  AlertTriangle 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { 
  calculateBudgetProgress, 
  calculateCategoryBudgetProgress, 
  calculateMonthlyTotal, 
  filterExpensesByMonth, 
  formatCurrency, 
  getCurrentBudget, 
  getCategories, 
  getPrettyCategoryName, 
  parseMonth 
} from '../../utils/helpers';
import BudgetForm from './BudgetForm';
import { ExpenseCategory } from '../../types';

const BudgetOverview: React.FC = () => {
  const { state } = useAppContext();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  
  const currentBudget = getCurrentBudget(state.budgets, state.currentMonth);
  const monthlyExpenses = filterExpensesByMonth(state.expenses, state.currentMonth);
  const totalSpent = calculateMonthlyTotal(state.expenses, state.currentMonth);
  const totalBudget = currentBudget.totalBudget;
  const remaining = totalBudget - totalSpent;
  const progress = calculateBudgetProgress(currentBudget, state.expenses);
  
  // Get categories with budget or expenses
  const getActiveCategories = (): ExpenseCategory[] => {
    const categoriesWithBudget = Object.keys(currentBudget.categories) as ExpenseCategory[];
    const categoriesWithExpenses = monthlyExpenses.map(e => e.category);
    
    const allActiveCategories = new Set([
      ...categoriesWithBudget,
      ...categoriesWithExpenses
    ]);
    
    return Array.from(allActiveCategories);
  };
  
  const activeCategories = getActiveCategories();
  
  // Calculate category totals
  const getCategoryTotal = (category: ExpenseCategory): number => {
    return monthlyExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };
  
  // Get color based on progress percentage
  const getProgressColor = (progress: number): string => {
    if (progress <= 70) return 'bg-success-500';
    if (progress <= 90) return 'bg-warning-500';
    return 'bg-error-500';
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">
          Budget for {parseMonth(state.currentMonth)}
        </h2>
        
        <button
          onClick={() => setShowBudgetForm(true)}
          className="btn btn-primary"
        >
          {totalBudget > 0 ? (
            <>
              <Edit className="h-5 w-5 mr-1" />
              Edit Budget
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-1" />
              Set Budget
            </>
          )}
        </button>
      </div>
      
      {!totalBudget ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500 mb-4">
            You haven't set a budget for this month yet
          </div>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-1" />
            Set Your Budget
          </button>
        </div>
      ) : (
        <>
          {/* Overall Budget Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Monthly Budget</h3>
                <p className="text-gray-500">
                  {progress.toFixed(0)}% of your budget used
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-2xl font-bold">
                  {formatCurrency(remaining > 0 ? remaining : 0)}
                </div>
                <div className="text-sm text-gray-500">
                  remaining of {formatCurrency(totalBudget)}
                </div>
              </div>
            </div>
            
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full ${getProgressColor(progress)}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between mt-2 text-sm">
              <div>Spent: {formatCurrency(totalSpent)}</div>
              <div>Budget: {formatCurrency(totalBudget)}</div>
            </div>
            
            {remaining < 0 && (
              <div className="mt-4 p-3 bg-error-50 text-error-700 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>You've exceeded your monthly budget by {formatCurrency(Math.abs(remaining))}</span>
              </div>
            )}
          </div>
          
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            
            <div className="space-y-6">
              {activeCategories.length > 0 ? (
                activeCategories.map((category) => {
                  const budgeted = currentBudget.categories[category] || 0;
                  const spent = getCategoryTotal(category);
                  const categoryProgress = budgeted 
                    ? (spent / budgeted) * 100 
                    : spent > 0 ? 100 : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: budgeted ? getProgressColor(categoryProgress) : '#9CA3AF' }}
                          />
                          <span>{getPrettyCategoryName(category)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(spent)} 
                            {budgeted > 0 && (
                              <span className="text-gray-500 text-sm ml-1">
                                of {formatCurrency(budgeted)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={budgeted ? getProgressColor(categoryProgress) : 'bg-gray-400'}
                          style={{ 
                            width: `${Math.min(categoryProgress, 100)}%`,
                            height: '100%'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No expenses or budget categories yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {showBudgetForm && (
        <BudgetForm onClose={() => setShowBudgetForm(false)} />
      )}
    </div>
  );
};

export default BudgetOverview;