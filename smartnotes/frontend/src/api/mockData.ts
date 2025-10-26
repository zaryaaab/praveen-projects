import { User, Note, Category } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Personal', color: '#FF6B6B' },
  { id: '2', name: 'Work', color: '#4ECDC4' },
  { id: '3', name: 'Study', color: '#45B7D1' },
  { id: '4', name: 'Ideas', color: '#96CEB4' }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes',
    content: 'Discussed project timeline and deliverables...',
    category: '2',
    tags: ['meeting', 'project'],
    privacy: 'private',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    userId: '1',
    collaborators: [],
    comments: []
  },
  {
    id: '2',
    title: 'Study Plan',
    content: 'Week 1: React fundamentals...',
    category: '3',
    tags: ['study', 'programming'],
    privacy: 'public',
    createdAt: '2024-03-09T15:00:00Z',
    updatedAt: '2024-03-09T15:00:00Z',
    userId: '1',
    collaborators: ['2'],
    comments: [
      {
        id: '1',
        content: 'Great plan!',
        userId: '2',
        userName: 'Jane Smith',
        createdAt: '2024-03-09T16:00:00Z'
      }
    ]
  }
];