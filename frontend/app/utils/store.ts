import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agency' | 'admin';
  avatar?: string;
  phone?: string;
  agencyName?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// Chat message interface
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  conversationId?: string;
}

// Chat state interface
interface ChatState {
  messages: ChatMessage[];
  currentConversationId: string | null;
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setConversationId: (id: string | null) => void;
}

// Package interface
interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  agency: string;
  maxPeople: number;
  category: string;
  highlights: string[];
  itinerary: string[];
  includes: string[];
  excludes: string[];
  images: string[];
}

// Package state interface
interface PackageState {
  packages: Package[];
  favorites: string[];
  isLoading: boolean;
  setPackages: (packages: Package[]) => void;
  addPackage: (pkg: Package) => void;
  updatePackage: (id: string, pkg: Partial<Package>) => void;
  removePackage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Redirect to home page after logout
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Create chat store
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: '1',
          role: 'ai',
          content: "Hello! I'm your WanderWild AI travel assistant. I can help you discover amazing destinations, find the best travel packages, and plan your perfect trip. What would you like to explore today?",
          timestamp: new Date(),
        },
      ],
      currentConversationId: null,
      isLoading: false,
      addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),
      setMessages: (messages: ChatMessage[]) => set({ messages }),
      clearMessages: () =>
        set({
          messages: [
            {
              id: '1',
              role: 'ai',
              content: "Hello! I'm your WanderWild AI travel assistant. I can help you discover amazing destinations, find the best travel packages, and plan your perfect trip. What would you like to explore today?",
              timestamp: new Date(),
            },
          ],
        }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setConversationId: (id: string | null) => set({ currentConversationId: id }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);

// Create package store
export const usePackageStore = create<PackageState>()(
  persist(
    (set, get) => ({
      packages: [],
      favorites: [],
      isLoading: false,
      setPackages: (packages: Package[]) => set({ packages }),
      addPackage: (pkg: Package) =>
        set((state) => ({
          packages: [...state.packages, pkg],
        })),
      updatePackage: (id: string, pkgData: Partial<Package>) =>
        set((state) => ({
          packages: state.packages.map((pkg) =>
            pkg.id === id ? { ...pkg, ...pkgData } : pkg
          ),
        })),
      removePackage: (id: string) =>
        set((state) => ({
          packages: state.packages.filter((pkg) => pkg.id !== id),
          favorites: state.favorites.filter((favId) => favId !== id),
        })),
      toggleFavorite: (id: string) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((favId) => favId !== id)
            : [...state.favorites, id],
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'package-storage',
      partialize: (state) => ({
        packages: state.packages,
        favorites: state.favorites,
      }),
    }
  )
);

// Theme store
interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newMode);
          }
          return { isDarkMode: newMode };
        }),
      setDarkMode: (isDark: boolean) =>
        set(() => {
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', isDark);
          }
          return { isDarkMode: isDark };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Utility functions
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.state?.user || null;
    } catch {
      return null;
    }
  }
  return null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    } catch {
      return null;
    }
  }
  return null;
};
