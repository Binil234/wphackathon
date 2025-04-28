import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { getCategories, getPrettyCategoryName } from '../../utils/helpers';

interface ExpenseFormProps {
  onClose: () => void;
  editExpense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, editExpense }) => {
  const { addExpense, updateExpense } = useAppContext();
  const categories = getCategories();
  
  const [amount, setAmount] = useState(editExpense?.amount.toString() || '');
  const [description, setDescription] = useState(editExpense?.description || '');
  const [category, setCategory] = useState<ExpenseCategory>(editExpense?.category || 'other');
  const [date, setDate] = useState(editExpense?.date || format(new Date(), 'yyyy-MM-dd'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isEditing = !!editExpense;
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than zero';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const expenseData = {
      amount: Number(amount),
      description,
      category,
      date,
    };
    
    if (isEditing && editExpense) {
      updateExpense({
        ...editExpense,
        ...expenseData,
      });
    } else {
      addExpense(expenseData);
    }
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center bg-primary-500 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-primary-600 rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-control">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`input pl-8 ${errors.amount ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-error-500">{errors.amount}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input ${errors.description ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              placeholder="e.g., Grocery shopping"
            />
            {errors.description && <p className="mt-1 text-sm text-error-500">{errors.description}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getPrettyCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-control">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`input ${errors.date ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
            />
            {errors.date && <p className="mt-1 text-sm text-error-500">{errors.date}</p>}
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
            >
              {isEditing ? 'Update' : 'Save'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;