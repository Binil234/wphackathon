import React, { useState } from 'react';
import { BarChart3, CreditCard, Menu, PieChart, Wallet, X, LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { supabase } from '../../lib/supabase';
import AuthForm from '../auth/AuthForm';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { state } = useAppContext();
  
  // Calculate total expenses for current month
  const currentMonthExpenses = state.expenses
    .filter(expense => expense.date.startsWith(state.currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get current budget
  const currentBudget = state.budgets.find(b => b.month === state.currentMonth);
  const budgetAmount = currentBudget?.totalBudget || 0;
  
  // Calculate remaining budget
  const remainingBudget = budgetAmount - currentMonthExpenses;
  
  const navItems: NavItem[] = [
    { 
      label: 'Expenses', 
      icon: <CreditCard className="h-5 w-5" />, 
      onClick: () => setActivePage('expenses') 
    },
    { 
      label: 'Budget', 
      icon: <Wallet className="h-5 w-5" />, 
      onClick: () => setActivePage('budget') 
    },
    { 
      label: 'Savings', 
      icon: <PieChart className="h-5 w-5" />, 
      onClick: () => setActivePage('savings') 
    },
    { 
      label: 'Insights', 
      icon: <BarChart3 className="h-5 w-5" />, 
      onClick: () => setActivePage('insights') 
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-primary-600 cursor-pointer"
              onClick={() => setActivePage('expenses')}
            >
              BudgetMaster
            </h1>
          </div>
          
          {/* Budget summary (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Budget: </span>
              <span className="font-medium">{formatCurrency(budgetAmount)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Spent: </span>
              <span className="font-medium">{formatCurrency(currentMonthExpenses)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Remaining: </span>
              <span className={`font-medium ${remainingBudget < 0 ? 'text-error-600' : 'text-success-600'}`}>
                {formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-8">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <button 
                      className={`flex items-center space-x-1 py-2 ${
                        activePage === item.label.toLowerCase() 
                          ? 'text-primary-600 border-b-2 border-primary-500' 
                          : 'text-gray-600 hover:text-primary-600'
                      }`}
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {state.user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthForm(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg animate-slide-down">
          <nav className="px-4 pt-2 pb-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button 
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full ${
                      activePage === item.label.toLowerCase() 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}

              {state.user ? (
                <li>
                  <button 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              ) : (
                <li>
                  <button 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      setShowAuthForm(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </button>
                </li>
              )}
            </ul>
            
            {/* Mobile budget summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Budget:</span>
                <span className="font-medium">{formatCurrency(budgetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Spent:</span>
                <span className="font-medium">{formatCurrency(currentMonthExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining:</span>
                <span className={`font-medium ${remainingBudget < 0 ? 'text-error-600' : 'text-success-600'}`}>
                  {formatCurrency(remainingBudget)}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthForm && (
        <AuthForm onClose={() => setShowAuthForm(false)} />
      )}
    </header>
  );
};

export default Header;