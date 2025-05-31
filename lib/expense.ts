import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { formatDate } from './utils';

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  description: string;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  notifyPercentage: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

interface ExpenseState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Savings goals actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeSavingsGoal: (id: string, amount: number) => void;
}

// Helper to create a secure storage for Zustand
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

// Initial categories
const initialCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#F97316' },
  { id: '2', name: 'Transportation', icon: 'car', color: '#3B82F6' },
  { id: '3', name: 'Housing', icon: 'home', color: '#10B981' },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
  { id: '5', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899' },
  { id: '6', name: 'Utilities', icon: 'bolt', color: '#F59E0B' },
  { id: '7', name: 'Healthcare', icon: 'heart', color: '#EF4444' },
  { id: '8', name: 'Salary', icon: 'briefcase', color: '#06B6D4' },
];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: initialCategories,
      budgets: [],
      savingsGoals: [],
      
      // Transaction actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { 
          ...transaction, 
          id: Math.random().toString(36).substring(2, 9) 
        }]
      })),
      
      updateTransaction: (id, transaction) => set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === id ? { ...t, ...transaction } : t
        )
      })),
      
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),
      
      // Category actions
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { 
          ...category, 
          id: Math.random().toString(36).substring(2, 9) 
        }]
      })),
      
      updateCategory: (id, category) => set((state) => ({
        categories: state.categories.map((c) => 
          c.id === id ? { ...c, ...category } : c
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      })),
      
      // Budget actions
      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, { 
          ...budget, 
          id: Math.random().toString(36).substring(2, 9) 
        }]
      })),
      
      updateBudget: (id, budget) => set((state) => ({
        budgets: state.budgets.map((b) => 
          b.id === id ? { ...b, ...budget } : b
        )
      })),
      
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id)
      })),
      
      // Savings goals actions
      addSavingsGoal: (goal) => set((state) => ({
        savingsGoals: [...state.savingsGoals, { 
          ...goal, 
          id: Math.random().toString(36).substring(2, 9) 
        }]
      })),
      
      updateSavingsGoal: (id, goal) => set((state) => ({
        savingsGoals: state.savingsGoals.map((g) => 
          g.id === id ? { ...g, ...goal } : g
        )
      })),
      
      deleteSavingsGoal: (id) => set((state) => ({
        savingsGoals: state.savingsGoals.filter((g) => g.id !== id)
      })),
      
      contributeSavingsGoal: (id, amount) => set((state) => ({
        savingsGoals: state.savingsGoals.map((g) => 
          g.id === id ? { 
            ...g, 
            currentAmount: g.currentAmount + amount 
          } : g
        )
      })),
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);