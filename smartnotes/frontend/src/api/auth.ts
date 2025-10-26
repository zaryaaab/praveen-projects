import { User } from '../types';

// Mock user data
let currentUser: User | null = null;

export const auth = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (email === 'demo@example.com' && password === 'password') {
      currentUser = {
        id: '1',
        name: 'John Doe',
        email: 'demo@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
      };
      return currentUser;
    }
    
    throw new Error('Invalid credentials');
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (email === 'demo@example.com') {
      throw new Error('Email already exists');
    }
    
    currentUser = {
      id: Date.now().toString(),
      name,
      email,
      avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces`
    };
    
    return currentUser;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    currentUser = {
      ...currentUser,
      ...data
    };
    
    return currentUser;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    if (currentPassword !== 'password') {
      throw new Error('Current password is incorrect');
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (email !== 'demo@example.com') {
      throw new Error('Email not found');
    }
  },

  logout: async (): Promise<void> => {
  },

  getCurrentUser: (): User | null => {
    return currentUser;
  }
};