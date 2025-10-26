import { FolderOpen, PlusCircle, Search, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { auth } from '../api/auth';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onNewNote: () => void;
}

export function Sidebar({ categories, selectedCategory, onSelectCategory, onNewNote }: SidebarProps) {
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-50 h-screen p-4 border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">Smart Notes</h1>
        {/* <button
          onClick={() => navigate('/profile')}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="w-5 h-5" />
        </button> */}
      </div>

      <button
        onClick={onNewNote}
        className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        New Note
      </button>

      <div className="mt-8">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
      </div>

      <nav className="mt-8 flex-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedCategory === null ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          All Notes
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg transition-colors ${
              selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}