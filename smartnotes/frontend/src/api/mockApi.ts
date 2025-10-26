import { mockUser, mockNotes, mockCategories } from './mockData';
import { Note, User, Category } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    return mockUser;
  },

  // Notes
  getNotes: async (): Promise<Note[]> => {
    await delay(300);
    return mockNotes;
  },

  createNote: async (note: Partial<Note>): Promise<Note> => {
    await delay(500);
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title || '',
      content: note.content || '',
      category: note.category || '',
      tags: note.tags || [],
      privacy: note.privacy || 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: mockUser.id,
      collaborators: [],
      comments: []
    };
    mockNotes.unshift(newNote);
    return newNote;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    await delay(300);
    return mockCategories;
  }
};