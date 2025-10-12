import { useState } from 'react';
import { 
  DollarSign,
  Users,
  PieChart,
  Receipt,
  History,
  Settings,
} from 'lucide-react';
import { ExpensePage } from './pages/Expense';
import { FriendsPage } from './pages/Friends';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { useSessionStore } from './store/sessionStore';
import {LoginPage} from './pages/Login';
import {RegisterPage} from './pages/Register';
import { fetchUserData } from './services/login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUserData] = useState(useSessionStore.getState().getUserData());
  const [getInitiated, setGetInitiated] = useState(false);
  if (!user) {
    if (!window.localStorage.getItem('token')) {
      if (activeTab === "register") {
        return <RegisterPage setActiveTab={setActiveTab} />
      }
      if (activeTab === "dashboard")
        setActiveTab("login")
      return <LoginPage setActiveTab={setActiveTab} />
    }
    else {
      if (!getInitiated) {
        setGetInitiated(true);
        fetchUserData().then(() => {
          setUserData(useSessionStore.getState().getUserData());
        });
      }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpensePage setActiveTab={setActiveTab}/>;
      case 'friends':
        return <FriendsPage />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
              QuickBill
          </h1>
        </div>
        
        <nav className="mt-6">
          <div className="px-4">
            {[
              { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
              { id: 'expenses', icon: Receipt, label: 'Expenses' },
              { id: 'friends', icon: Users, label: 'Friends' },
              { id: 'analytics', icon: PieChart, label: 'Analytics' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg mb-1
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user?.firstName + " " + user?.lastName}</span>
              </div>
            </div>
          </div>
        </header>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;