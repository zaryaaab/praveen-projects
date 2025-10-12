import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { getExpenseAnalytics, getBudgetSuggestions } from '../services/expenses';

interface CategoryBreakdown {
  category: string;
  total_amount: number;
  count: number;
}

interface SpendingTrend {
  month?: string;
  week?: string;
  total_amount: number;
  count: number;
}

interface BudgetSuggestion {
  type: 'warning' | 'tip' | 'positive';
  message: string;
  category: string;
}

interface AnalyticsData {
  category_breakdown: CategoryBreakdown[];
  monthly_spending: SpendingTrend[];
  weekly_spending: SpendingTrend[];
  total_expenses: number;
  total_amount: number;
  recent_expenses: any[];
}

interface BudgetData {
  monthly_average: number;
  suggestions: BudgetSuggestion[];
  category_breakdown: any[];
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, budgetSuggestions] = await Promise.all([
          getExpenseAnalytics(),
          getBudgetSuggestions()
        ]);
        setAnalytics(analyticsData);
        setBudgetData(budgetSuggestions);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'FOOD': 'Food & Dining',
      'TRANSPORT': 'Transportation',
      'ENTERTAINMENT': 'Entertainment',
      'SHOPPING': 'Shopping',
      'UTILITIES': 'Utilities',
      'HEALTHCARE': 'Healthcare',
      'TRAVEL': 'Travel',
      'EDUCATION': 'Education',
      'OTHER': 'Other'
    };
    return categoryMap[category] || category;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'tip':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Expense Analytics</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_expenses || 0}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${analytics?.total_amount || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900">${budgetData?.monthly_average?.toFixed(2) || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.category_breakdown?.length || 0}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending by Category
          </h3>
          <div className="space-y-4">
            {analytics?.category_breakdown?.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" style={{
                    backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                  }}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {getCategoryDisplayName(category.category)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${category.total_amount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.count} expenses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Suggestions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Suggestions
          </h3>
          <div className="space-y-4">
            {budgetData?.suggestions?.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Category: {suggestion.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Monthly Spending Trend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {analytics?.monthly_spending?.map((month, index) => (
            <div key={index} className="text-center">
              <div className="bg-indigo-100 rounded-lg p-4 mb-2">
                <div className="text-lg font-semibold text-indigo-900">
                  ${month.total_amount}
                </div>
                <div className="text-xs text-indigo-600">
                  {month.count} expenses
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(month.month || '').toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {analytics?.recent_expenses?.slice(0, 5).map((expense, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{expense.title}</div>
                <div className="text-sm text-gray-500">
                  {getCategoryDisplayName(expense.category)} • {new Date(expense.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                ${expense.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}