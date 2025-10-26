import { MessageSquare, Share2, Clock } from 'lucide-react';
import { Note, Category } from '../types';

interface NoteCardProps {
  note: Note;
  category: Category | undefined;
}

export function NoteCard({ note, category }: NoteCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
        <div className="flex items-center gap-2">
          {note.privacy !== 'private' && (
            <Share2 className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {category && (
        <span
          className="inline-block px-2 py-1 mt-2 text-xs rounded-full"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color
          }}
        >
          {category.name}
        </span>
      )}

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{note.content}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {note.comments.length}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(note.updatedAt)}
          </div>
        </div>
        
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}