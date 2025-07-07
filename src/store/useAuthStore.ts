import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Student, Coach } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Helpers
  isStudent: () => boolean;
  isCoach: () => boolean;
  getCurrentUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: (user) => set({
        user,
        isAuthenticated: true,
        isLoading: false
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      }),

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
              updatedAt: new Date()
            }
          });
        }
      },

      isStudent: () => {
        const user = get().user;
        return user?.role === 'student';
      },

      isCoach: () => {
        const user = get().user;
        return user?.role === 'coach';
      },

      getCurrentUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
); 