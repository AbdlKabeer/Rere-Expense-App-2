import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

// Mock user data for demo purposes
const USERS = [
  { id: '1', email: 'user@example.com', password: 'password123', name: 'Demo User' },
];

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  initialize: async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      const user = USERS.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      // Store user in secure storage
      await SecureStore.setItemAsync('user', JSON.stringify(userWithoutPassword));
      
      set({ user: userWithoutPassword, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      const existingUser = USERS.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser = {
        id: String(USERS.length + 1),
        email,
        password,
        name,
      };
      
      // Add to mock database
      USERS.push(newUser);
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store user in secure storage
      await SecureStore.setItemAsync('user', JSON.stringify(userWithoutPassword));
      
      set({ user: userWithoutPassword, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      set({ user: null });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },
}));