import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PageRoute, UserRole } from './types';

interface AppState {
  // Navigation
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  previousPage: PageRoute | null;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  
  // UI State
  navbarVisible: boolean;
  setNavbarVisible: (visible: boolean) => void;
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  removeNotification: (id: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentPage: 'home',
      setCurrentPage: (page) => set((state) => ({ 
        previousPage: state.currentPage, 
        currentPage: page 
      })),
      previousPage: null,

      // Auth
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true, currentPage: 'dashboard' }),
      logout: () => set({ user: null, isAuthenticated: false, currentPage: 'home' }),

      // UI
      navbarVisible: true,
      setNavbarVisible: (visible) => set({ navbarVisible: visible }),
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 20)
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'hungerfree-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
      }),
    }
  )
);
