import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Coins as Coin, X } from 'lucide-react';
import { 
  formatCurrency, 
  getCategories, 
  getPrettyCategoryName 
} from '../../utils/helpers';

interface BudgetFormProps {
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose }) => {
  const { state, updateBudget } = useAppContext();
  const currentBudget = state.budgets.find(b => b.month === state.currentMonth);
  const categories = getCategories();
  
  const [totalBudget, setTotalBudget] = useState(
    currentBudget?.totalBudget.toString() || ''
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(
    categories.reduce((acc, category) => {
      acc[category] = (currentBudget?.categories[category] || '').toString();
      return acc;
    }, {} as Record<string, string>)
  );
  
  // Calculate allocated budget
  const allocatedAmount = Object.values(categoryBudgets)
    .filter(amount => amount !== '')
    .reduce((sum, amount) => sum + Number(amount), 0);
  
  // Calculate unallocated budget
  const unallocatedAmount = totalBudget 
    ? Number(totalBudget) - allocatedAmount 
    : 0;
  
  const handleCategoryBudgetChange = (category: string, value: string) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totalBudget || isNaN(Number(totalBudget)) || Number(totalBudget) < 0) {
      return;
    }
    
    const parsedCategoryBudgets: Record<string, number> = {};
    
    Object.entries(categoryBudgets).forEach(([category, amount]) => {
      if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
        parsedCategoryBudgets[category] = Number(amount);
      }
    });
    
    const newBudget = {
      id: currentBudget?.id || crypto.randomUUID(),
      month: state.currentMonth,
      categories: parsedCategoryBudgets,
      totalBudget: Number(totalBudget),
    };
    
    updateBudget(newBudget);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center bg-primary-500 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Set Budget</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-primary-600 rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="form-control">
            <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-1">
              Total Monthly Budget
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="totalBudget"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="input pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Budget:</span>
              <span>{formatCurrency(Number(totalBudget) || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Allocated:</span>
              <span>{formatCurrency(allocatedAmount)}</span>
            </div>
            <div className={`flex justify-between text-sm font-medium ${unallocatedAmount < 0 ? 'text-error-600' : ''}`}>
              <span>Unallocated:</span>
              <span>{formatCurrency(unallocatedAmount)}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900">
            Category Budgets
          </h3>
          
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="form-control">
                <label 
                  htmlFor={`budget-${category}`} 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {getPrettyCategoryName(category)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id={`budget-${category}`}
                    value={categoryBudgets[category]}
                    onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                    className="input pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!totalBudget || isNaN(Number(totalBudget)) || Number(totalBudget) < 0}
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;