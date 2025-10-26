export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  privacy: 'private' | 'public' | 'shared';
  createdAt: string;
  updatedAt: string;
  userId: string;
  collaborators: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}