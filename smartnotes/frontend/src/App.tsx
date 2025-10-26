import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NewNoteModal } from './components/NewNoteModal';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ProfileSettings } from './components/ProfileSettings';
import { AuthLayout } from './components/AuthLayout';
import { Note, Category } from './types';
import { api } from './api/mockApi';
import { Plus } from 'lucide-react';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [notesData, categoriesData] = await Promise.all([
        api.getNotes(),
        api.getCategories()
      ]);
      setSearchQuery('d')
      setNotes(notesData);
      setCategories(categoriesData);
    };
    fetchData();
  }, []);

  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    privacy: 'private' | 'public' | 'shared';
  }) => {
    if (notes.some(note => note.title.toLowerCase() === noteData.title.toLowerCase())) {
      return;
    }
    const newNote = await api.createNote(noteData);
    setNotes([newNote, ...notes]);
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const MainContent = () => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewNote={() => setIsNewNoteModalOpen(true)}
      />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name + ' Notes'
                : 'All Notes'}
            </h2>
            <button
              onClick={() => setIsNewNoteModalOpen(true)}
              className="bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                category={categories.find(c => c.id === note.category)}
              />
            ))}
          </div>
        </div>
      </main>

      <NewNoteModal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        onSave={handleCreateNote}
        categories={categories}
      />
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/profile"
          element={
            <AuthLayout>
              <ProfileSettings />
            </AuthLayout>
          }
        />
        <Route
          path="/"
          element={
            <AuthLayout>
              <MainContent />
            </AuthLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;