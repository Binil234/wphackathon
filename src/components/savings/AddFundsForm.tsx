import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface AddFundsFormProps {
  goal: SavingsGoal;
  onClose: () => void;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ goal, onClose }) => {
  const { updateSavingsAmount } = useAppContext();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const newTotal = goal.currentAmount + numAmount;
    const remaining = goal.targetAmount - goal.currentAmount;
    
    // Check if adding this amount would exceed the target
    if (newTotal > goal.targetAmount) {
      setError(`Amount exceeds remaining goal of ${formatCurrency(remaining)}`);
      return;
    }
    
    updateSavingsAmount(goal.id, newTotal);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center bg-primary-500 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Add Funds to {goal.name}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-primary-600 rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddFunds} className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Amount:</span>
              <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target Amount:</span>
              <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Remaining:</span>
              <span className="font-medium">{formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
            </div>
          </div>
          
          <div className="form-control">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Add
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className={`input pl-8 ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={goal.targetAmount - goal.currentAmount}
              />
            </div>
            {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
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
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsForm;