import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { ArrowUp, ArrowDown, Home, CreditCard, BarChart3, Settings, Plus } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
};

// Types
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category | null;
  note: string;
  date: string;
  timestamp: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

const categories: Category[] = [
  { id: 1, name: 'Food', icon: '🍔', color: '#FFEDD5' },
  { id: 2, name: 'Shopping', icon: '🛍️', color: '#F3E8FF' },
  { id: 3, name: 'Entertainment', icon: '🎬', color: '#FEE2E2' },
  { id: 4, name: 'Travel', icon: '✈️', color: '#DCFCE7' },
  { id: 5, name: 'Home', icon: '🏠', color: '#FEF9C3' },
  { id: 6, name: 'Pet', icon: '🐾', color: '#DBEAFE' },
  { id: 7, name: 'Salary', icon: '💰', color: '#D1FAE5' },
  { id: 8, name: 'Gift', icon: '🎁', color: '#E0E7FF' },
];

const TransactionStorage = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      console.log('Raw transactions JSON:', transactionsJson);
      const parsed = transactionsJson ? JSON.parse(transactionsJson) : [];
      console.log('Parsed transactions:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = (dateStr: string) => {
  try {
    const parsedDate = new Date(dateStr.replace(/,/, '')); // Remove comma for reliable parsing
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date string: ${dateStr}`);
      return dateStr; // Fallback to raw string
    }
    const today = new Date();
    const isToday = parsedDate.toDateString() === today.toDateString();
    const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === parsedDate.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return parsedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return dateStr; // Fallback to raw string
  }
};

const HomeScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [balance, setBalance] = useState(0);
  const navigation = useNavigation();

  const fetchTransactions = async () => {
    try {
      const fetchedTransactions = await TransactionStorage.getTransactions();
      console.log('Fetched transactions:', fetchedTransactions);
      setTransactions(fetchedTransactions);

      const expensesSum = fetchedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const incomeSum = fetchedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      setTotalExpenses(expensesSum);
      setTotalIncome(incomeSum);
      setBalance(incomeSum - expensesSum);
      
      console.log('Income sum:', incomeSum, 'Expenses sum:', expensesSum, 'Balance:', incomeSum - expensesSum);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Fetching transactions on focus');
      fetchTransactions();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#6B7280', fontSize: 26, marginBottom: 4 }}>{getGreeting()}</Text>
          </View>
          <View style={{ backgroundColor: '#3B82F6', borderRadius: 24, padding: 24, marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Total Balance</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '700', marginBottom: 24 }}>
              {formatCurrency(balance)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <ArrowDown size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }}>Income</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{formatCurrency(totalIncome)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <ArrowUp size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }}>Expenses</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{formatCurrency(totalExpenses)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700' }}>Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('transactions')}>
              <Text style={{ color: '#3B82F6', fontWeight: '500' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
            {transactions.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>No transactions yet</Text>
              </View>
            ) : (
              transactions.slice(0, 4).map((transaction: Transaction, index: number) => {
                const category = categories.find(cat => cat.id === transaction.category?.id) || {
                  name: 'Unknown',
                  icon: '❓',
                  color: '#F3F4F6',
                };
                return (
                  <View
                    key={transaction.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      ...(index < transactions.slice(0, 4).length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }
                        : {}),
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: category.color,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{category.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>{category.name}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 14 }}>{formatDate(transaction.date)}</Text>
                    </View>
                    <Text style={{ 
                      color: transaction.type === 'income' ? '#10B981' : '#EF4444', 
                      fontWeight: '700' 
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={{ padding: 12 }}>
            <Home size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 12 }}>
            <CreditCard size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#3B82F6', width: 56, height: 56, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => navigation.navigate('add')}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 12 }}>
            <BarChart3 size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 12 }}>
            <Settings size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;