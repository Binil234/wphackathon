import React, { useState } from 'react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { 
  Calendar, 
  CheckCircle, 
  CreditCard, 
  Edit, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { calculateSavingsProgress, formatCurrency, formatDate } from '../../utils/helpers';
import SavingsGoalForm from './SavingsGoalForm';
import { SavingsGoal } from '../../types';
import AddFundsForm from './AddFundsForm';

const SavingsGoalList: React.FC = () => {
  const { state, deleteSavingsGoal } = useAppContext();
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [fundingGoal, setFundingGoal] = useState<SavingsGoal | null>(null);
  
  const orderedGoals = [...state.savingsGoals].sort((a, b) => {
    // First by completion status
    const aProgress = calculateSavingsProgress(a);
    const bProgress = calculateSavingsProgress(b);
    const aCompleted = aProgress >= 100;
    const bCompleted = bProgress >= 100;
    
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }
    
    // Then by target date (earliest first)
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });
  
  // Get time remaining message
  const getTimeRemaining = (goal: SavingsGoal): string => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    if (isBefore(targetDate, today)) {
      return 'Goal date passed';
    }
    
    const daysRemaining = differenceInDays(targetDate, today);
    
    if (daysRemaining <= 0) {
      return 'Due today';
    } else if (daysRemaining === 1) {
      return '1 day remaining';
    } else if (daysRemaining < 30) {
      return `${daysRemaining} days remaining`;
    } else if (daysRemaining < 365) {
      const months = Math.floor(daysRemaining / 30);
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    } else {
      const years = Math.floor(daysRemaining / 365);
      return `${years} year${years > 1 ? 's' : ''} remaining`;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        
        <button
          onClick={() => setShowAddGoalForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Goal
        </button>
      </div>
      
      {orderedGoals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500 mb-4">You don't have any savings goals yet</div>
          <button
            onClick={() => setShowAddGoalForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderedGoals.map((goal) => {
            const progress = calculateSavingsProgress(goal);
            const isCompleted = progress >= 100;
            
            return (
              <div 
                key={goal.id} 
                className={`card hover:shadow-lg transition-all ${
                  isCompleted ? 'bg-success-50 border border-success-100' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{goal.name}</h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setEditingGoal(goal)}
                      className="text-gray-500 hover:text-primary-500 p-1"
                      aria-label="Edit goal"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(goal.id)}
                      className="text-gray-500 hover:text-error-500 p-1"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-gray-500 text-sm">
                      {isCompleted ? (
                        <div className="flex items-center text-success-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Goal Achieved!</span>
                        </div>
                      ) : (
                        <span>{progress.toFixed(0)}% of target</span>
                      )}
                    </div>
                    <div className="text-sm flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(goal.targetDate)}</span>
                    </div>
                  </div>
                  
                  <div className="relative h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current:</span>
                    <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target:</span>
                    <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium">{formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))}</span>
                  </div>
                  {!isCompleted && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timeline:</span>
                      <span className="font-medium">{getTimeRemaining(goal)}</span>
                    </div>
                  )}
                </div>
                
                {!isCompleted && (
                  <button
                    onClick={() => setFundingGoal(goal)}
                    className="btn btn-primary w-full mt-4 flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Add Funds
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add/Edit Goal Modal */}
      {(showAddGoalForm || editingGoal) && (
        <SavingsGoalForm
          onClose={() => {
            setShowAddGoalForm(false);
            setEditingGoal(null);
          }}
          editGoal={editingGoal || undefined}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Savings Goal
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this savings goal? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm) {
                      deleteSavingsGoal(showDeleteConfirm);
                      setShowDeleteConfirm(null);
                    }
                  }}
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Funds Modal */}
      {fundingGoal && (
        <AddFundsForm 
          goal={fundingGoal}
          onClose={() => setFundingGoal(null)}
        />
      )}
    </div>
  );
};

export default SavingsGoalList;