import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format, parse } from 'date-fns';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Edit, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  getCurrentMonth, 
  getPrettyCategoryName, 
  parseMonth 
} from '../../utils/helpers';
import ExpenseForm from './ExpenseForm';
import { Expense, ExpenseCategory } from '../../types';

const ExpenseList: React.FC = () => {
  const { state, deleteExpense, setCurrentMonth } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Handle sort change
  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort expenses
  const filteredAndSortedExpenses = state.expenses
    .filter(expense => {
      const matchesMonth = expense.date.startsWith(state.currentMonth);
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      return matchesMonth && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
  
  // Calculate total of filtered expenses
  const totalAmount = filteredAndSortedExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  // Get all available categories from expenses
  const allCategories = Array.from(
    new Set(state.expenses.map(expense => expense.category))
  );
  
  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(e.target.value);
  };
  
  // Get available months from expenses, plus current month
  const getAvailableMonths = () => {
    const months = new Set<string>([getCurrentMonth()]);
    
    state.expenses.forEach(expense => {
      const month = expense.date.substring(0, 7);
      months.add(month);
    });
    
    return Array.from(months).sort().reverse();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
              className="select"
            >
              <option value="all">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {getPrettyCategoryName(category)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={state.currentMonth}
              onChange={handleMonthChange}
              className="select"
            >
              {getAvailableMonths().map(month => (
                <option key={month} value={month}>
                  {parseMonth(month)}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            <span>Add</span>
          </button>
        </div>
      </div>
      
      {filteredAndSortedExpenses.length > 0 ? (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === 'date' && (
                        sortDirection === 'asc' 
                          ? <ArrowUp className="h-4 w-4" /> 
                          : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Amount</span>
                      {sortField === 'amount' && (
                        sortDirection === 'asc' 
                          ? <ArrowUp className="h-4 w-4" /> 
                          : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(expense.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge badge-${expense.category === 'other' ? 'secondary' : 'primary'}`}>
                        {getPrettyCategoryName(expense.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="text-primary-500 hover:text-primary-700"
                          aria-label="Edit expense"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(expense.id)}
                          className="text-error-500 hover:text-error-700"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center animate-fade-in">
          <div className="text-gray-500 mb-4">No expenses found for this month</div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Your First Expense
          </button>
        </div>
      )}
      
      {/* Add/Edit Expense Modal */}
      {(showAddExpense || editingExpense) && (
        <ExpenseForm
          onClose={() => {
            setShowAddExpense(false);
            setEditingExpense(null);
          }}
          editExpense={editingExpense || undefined}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Expense
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
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
                      deleteExpense(showDeleteConfirm);
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
    </div>
  );
};

export default ExpenseList;