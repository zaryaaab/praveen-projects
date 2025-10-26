import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface SessionState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  getUserData: () => User | null;
}

export const useSessionStore = create<SessionState>()(
    subscribeWithSelector((set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
      }),
      getUserData: () => get().user,
      clearSession: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
      }),
    }),
  )
);
