import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PageRoute, UserRole } from './types';

interface AppState {
  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Navigation
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  previousPage: PageRoute | null;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setAuthToken: (token: string | null) => void;
  
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
      // Hydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

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
      authToken: null,
      login: (user, token) => set({
        user,
        isAuthenticated: true,
        currentPage: 'dashboard',
        ...(token ? { authToken: token } : {}),
      }),
      logout: () => {
        // Fire-and-forget server-side logout
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        }).catch(() => {});
        set({ user: null, isAuthenticated: false, authToken: null, currentPage: 'home' });
      },
      setAuthToken: (token) => set({ authToken: token }),

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
        authToken: state.authToken,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);
