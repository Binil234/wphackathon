import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, getCategoryColors, getPrettyCategoryName, parseMonth } from '../../utils/helpers';
import { ExpenseCategory } from '../../types';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const SpendingInsights: React.FC = () => {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'categories' | 'trends' | 'comparison'>('categories');
  
  // Current month expenses by category
  const currentMonthExpensesByCategory = () => {
    const categories: Record<string, number> = {};
    
    state.expenses
      .filter(exp => exp.date.startsWith(state.currentMonth))
      .forEach(exp => {
        if (!categories[exp.category]) {
          categories[exp.category] = 0;
        }
        categories[exp.category] += exp.amount;
      });
    
    return categories;
  };
  
  // Prepare data for category pie chart
  const getCategoryChartData = () => {
    const expensesByCategory = currentMonthExpensesByCategory();
    const categories = Object.keys(expensesByCategory) as ExpenseCategory[];
    const categoryColors = getCategoryColors();
    
    return {
      labels: categories.map(getPrettyCategoryName),
      datasets: [
        {
          data: categories.map(cat => expensesByCategory[cat]),
          backgroundColor: categories.map(cat => categoryColors[cat]),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare data for monthly trends chart
  const getMonthlyTrendsData = () => {
    const lastSixMonths = state.monthlySummaries.slice(-6);
    
    return {
      labels: lastSixMonths.map(m => parseMonth(m.month)),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: lastSixMonths.map(m => m.total),
          borderColor: '#0D9488',
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };
  
  // Top 5 expense categories for comparison
  const getTopCategories = (): ExpenseCategory[] => {
    const currentExpenses = currentMonthExpensesByCategory();
    
    return Object.entries(currentExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category as ExpenseCategory);
  };
  
  // Prepare data for category comparison chart
  const getCategoryComparisonData = () => {
    const topCategories = getTopCategories();
    const lastThreeMonths = state.monthlySummaries.slice(-3);
    const categoryColors = getCategoryColors();
    
    return {
      labels: lastThreeMonths.map(m => parseMonth(m.month)),
      datasets: topCategories.map(category => ({
        label: getPrettyCategoryName(category),
        data: lastThreeMonths.map(month => month.categories[category] || 0),
        backgroundColor: categoryColors[category],
        barPercentage: 0.7,
      })),
    };
  };
  
  // Options for bar chart
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  // Options for pie chart
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatCurrency(context.parsed);
            }
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            label += ` (${percentage}%)`;
            return label;
          }
        }
      }
    }
  };
  
  // Options for line chart
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Spending Insights</h2>
      
      {state.expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">
            Add some expenses to see insights about your spending habits
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'categories'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('categories')}
                >
                  Spending by Category
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'trends'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('trends')}
                >
                  Monthly Trends
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'comparison'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('comparison')}
                >
                  Category Comparison
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'categories' && (
                <div className="max-w-xl mx-auto h-80">
                  {Object.keys(currentMonthExpensesByCategory()).length > 0 ? (
                    <Pie data={getCategoryChartData()} options={pieOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No expense data available for this month
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'trends' && (
                <div className="h-80">
                  {state.monthlySummaries.length > 0 ? (
                    <Line data={getMonthlyTrendsData()} options={lineOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Not enough data to show monthly trends
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'comparison' && (
                <div className="h-80">
                  {state.monthlySummaries.length > 1 && getTopCategories().length > 0 ? (
                    <Bar data={getCategoryComparisonData()} options={barOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Not enough data to compare categories across months
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Spending Stats</h3>
              
              {state.monthlySummaries.length > 1 ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-500 mb-1">Average monthly spending</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        state.monthlySummaries.reduce((sum, month) => sum + month.total, 0) / 
                        state.monthlySummaries.length
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Highest spending month</div>
                    {(() => {
                      const highestMonth = [...state.monthlySummaries].sort((a, b) => b.total - a.total)[0];
                      return (
                        <div className="flex justify-between items-baseline">
                          <div className="text-xl font-semibold">
                            {formatCurrency(highestMonth.total)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {parseMonth(highestMonth.month)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Lowest spending month</div>
                    {(() => {
                      const lowestMonth = [...state.monthlySummaries]
                        .filter(m => m.total > 0)
                        .sort((a, b) => a.total - b.total)[0];
                      
                      return lowestMonth ? (
                        <div className="flex justify-between items-baseline">
                          <div className="text-xl font-semibold">
                            {formatCurrency(lowestMonth.total)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {parseMonth(lowestMonth.month)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No data available</div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  More data needed for meaningful stats
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Top Spending Categories</h3>
              
              {getTopCategories().length > 0 ? (
                <div className="space-y-3">
                  {getTopCategories().map((category) => {
                    const amount = currentMonthExpensesByCategory()[category];
                    const totalSpent = Object.values(currentMonthExpensesByCategory()).reduce((sum, val) => sum + val, 0);
                    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getCategoryColors()[category] }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{getPrettyCategoryName(category)}</span>
                            <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: getCategoryColors()[category]
                              }}
                            />
                          </div>
                        </div>
                        <span className="ml-4 font-medium">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500">
                  No expense data available for this month
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingInsights;