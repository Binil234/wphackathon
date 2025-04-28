import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import ExpenseList from './components/expenses/ExpenseList';
import BudgetOverview from './components/budget/BudgetOverview';
import SavingsGoalList from './components/savings/SavingsGoalList';
import SpendingInsights from './components/insights/SpendingInsights';
import AuthForm from './components/auth/AuthForm';
import { useAppContext } from './context/AppContext';

function AppContent() {
  const [activePage, setActivePage] = useState('expenses');
  const { state } = useAppContext();
  
  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-primary-600 mb-8">
            BudgetMaster
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 text-center mb-6">
              Please log in or sign up to manage your finances
            </p>
            <AuthForm onClose={() => {}} />
          </div>
        </div>
      </div>
    );
  }
  
  // Render the active page component
  const renderActivePage = () => {
    switch (activePage) {
      case 'expenses':
        return <ExpenseList />;
      case 'budget':
        return <BudgetOverview />;
      case 'savings':
        return <SavingsGoalList />;
      case 'insights':
        return <SpendingInsights />;
      default:
        return <ExpenseList />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;