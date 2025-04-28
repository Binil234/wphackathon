import React, { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { SavingsGoal } from '../../types';

interface SavingsGoalFormProps {
  onClose: () => void;
  editGoal?: SavingsGoal;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ onClose, editGoal }) => {
  const { addSavingsGoal, updateSavingsGoal } = useAppContext();
  const isEditing = !!editGoal;
  
  const [name, setName] = useState(editGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(editGoal?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(editGoal?.currentAmount.toString() || '0');
  const [targetDate, setTargetDate] = useState(
    editGoal?.targetDate || format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [category, setCategory] = useState(editGoal?.category || 'vacation');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const categories = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'house', label: 'House' },
    { value: 'car', label: 'Car' },
    { value: 'education', label: 'Education' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'other', label: 'Other' },
  ];
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount greater than zero';
    }
    
    if (!currentAmount || isNaN(Number(currentAmount)) || Number(currentAmount) < 0) {
      newErrors.currentAmount = 'Please enter a valid current amount (0 or greater)';
    }
    
    if (Number(currentAmount) > Number(targetAmount)) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
    }
    
    if (!targetDate) {
      newErrors.targetDate = 'Target date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const goalData = {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      targetDate,
      category,
    };
    
    if (isEditing && editGoal) {
      updateSavingsGoal({
        ...editGoal,
        ...goalData,
      });
    } else {
      addSavingsGoal(goalData);
    }
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center bg-primary-500 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Savings Goal' : 'Create Savings Goal'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input ${errors.name ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              placeholder="e.g., Hawaii Vacation"
            />
            {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="targetAmount"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className={`input pl-8 ${errors.targetAmount ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.targetAmount && <p className="mt-1 text-sm text-error-500">{errors.targetAmount}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Current Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="currentAmount"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className={`input pl-8 ${errors.currentAmount ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.currentAmount && <p className="mt-1 text-sm text-error-500">{errors.currentAmount}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              id="targetDate"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={`input ${errors.targetDate ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.targetDate && <p className="mt-1 text-sm text-error-500">{errors.targetDate}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
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
              {isEditing ? 'Update' : 'Create'} Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalForm;