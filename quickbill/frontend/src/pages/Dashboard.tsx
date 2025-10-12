import {
  Users,
  Plus,
  Receipt,
  CreditCard,
  PowerCircleIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getExpenses, getTotalExpense } from '../services/expenses';
import { useSessionStore } from '../store/sessionStore';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const [expenses, setExpenses] = useState([]);
  const [incoming, setIncoming] = useState(0);
  const [outgoing, setOutgoing] = useState(0);
  const [lastMonthExpense, setLastMonthExpense] = useState(0);
  const [lastWeekExpense, setLastWeekExpense] = useState(0);
  useEffect(() => {
    getExpenses().then((expenseList) => {
      setExpenses(expenseList);
      getTotalExpense(useSessionStore.getState().getUserData()?.username).then(
        (total) => {
          setIncoming(total.total_owed);
          setOutgoing(total.total_owes);
          setLastMonthExpense(total.spent_last_week);
          setLastWeekExpense(total.spent_last_month);
        }
      )
    })
  }, [])

  return (
    <main className="p-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">You Owe</p>
              <p className="text-2xl font-bold text-red-600">${outgoing}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">You're Owed</p>
              <p className="text-2xl font-bold text-green-600">${incoming}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Last month expenditure</p>
              <p className="text-2xl font-bold text-red-600">${lastMonthExpense}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Last week expenditure</p>
              <p className="text-2xl font-bold text-green-600">${lastWeekExpense}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Add Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {expenses.map((expense) =>
                {
                  let totalAmount = 0;
                  for (let i = 0; i < expense.shares.length; i++) {
                    totalAmount += expense.shares[i].amount;
                  }
                  return (
                    <div key={expense} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{expense.title}</p>
                        <p className="text-sm text-gray-500">Split with {expense.peopleCount} {expense.peopleCount > 1 ? 'people' : 'person'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${expense.amount}</p>
                        <p className="text-sm text-gray-500">Your share: ${expense.amount - totalAmount}</p>
                      </div>
                    </div>
                  )})}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('expenses')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                Add New Expense
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Users className="h-5 w-5" />
                Add Friends
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <CreditCard className="h-5 w-5" />
                Settle Up
              </button>
              <button 
                onClick={() => {
                  window.localStorage.clear()
                  window.location.replace("/")
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <PowerCircleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
