import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Filter, Home, CreditCard, BarChart3, Settings, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
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

interface ChartData {
  month: string;
  income: number;
  expense: number;
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

const formatDate = (dateStr: string) => {
  try {
    // Parse the date string in the expected format
    const parsedDate = new Date(dateStr.replace(/,/, '')); // Remove comma for better parsing
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date string: ${dateStr}`);
      return dateStr; // Fallback to raw string if parsing fails
    }
    const today = new Date();
    const isToday = parsedDate.toDateString() === today.toDateString();
    const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === parsedDate.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return parsedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return dateStr; // Fallback to raw string on error
  }
};

const formatDateRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const TransactionsScreen = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [dateRange, setDateRange] = useState('');

  const fetchTransactions = async () => {
    try {
      const fetchedTransactions = await TransactionStorage.getTransactions();
      setTransactions(fetchedTransactions);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);
      setDateRange(formatDateRange(startDate, endDate));

      const filteredTransactions = fetchedTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const incomeSum = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const expenseSum = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      setTotalIncome(incomeSum);
      setTotalExpenses(expenseSum);

      const monthlyData: { [key: string]: { income: number; expense: number } } = {};
      filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const monthKey = date.toLocaleString('en-US', { month: '2-digit' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });

      const newChartData: ChartData[] = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(endDate.getMonth() - 5 + i);
        const month = date.toLocaleString('en-US', { month: '2-digit' });
        return {
          month,
          income: monthlyData[month]?.income || 0,
          expense: monthlyData[month]?.expense || 0,
        };
      });
      setChartData(newChartData);

      console.log('Fetched transactions:', fetchedTransactions);
      console.log('Chart data:', newChartData);
      console.log('Total income:', incomeSum, 'Total expenses:', expenseSum);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const maxIncome = Math.max(...chartData.map(d => d.income), 1);
  const maxExpense = Math.max(...chartData.map(d => d.expense), 1);
  const maxValue = Math.max(maxIncome, maxExpense);

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = formatDate(transaction.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {} as { [key: string]: Transaction[] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700' }}>Transactions</Text>
          <TouchableOpacity>
            <Filter size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 16, padding: 4, marginBottom: 24 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                ...(activeTab === 'income' ? {
                  backgroundColor: '#10B981',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                } : {}),
              }}
              onPress={() => setActiveTab('income')}
            >
              <Text style={{ textAlign: 'center', fontWeight: '500', color: activeTab === 'income' ? '#FFFFFF' : '#6B7280' }}>
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                ...(activeTab === 'expense' ? { 
                  backgroundColor: '#60A5FA',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                } : {}),
              }}
              onPress={() => setActiveTab('expense')}
            >
              <Text style={{ textAlign: 'center', fontWeight: '500', color: activeTab === 'expense' ? '#FFFFFF' : '#6B7280' }}>
                Expenses
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>{dateRange}</Text>
          <Text style={{ color: '#111827', fontSize: 30, fontWeight: '700', marginBottom: 24 }}>
            {formatCurrency(activeTab === 'income' ? totalIncome : totalExpenses)}
          </Text>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24 }}>
            {chartData.length === 0 ? (
              <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#6B7280' }}>No transaction data available</Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, marginBottom: 16 }}>
                  {chartData.map((data, index) => {
                    const value = activeTab === 'income' ? data.income : data.expense;
                    const height = (value / maxValue) * 120;
                    return (
                      <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
                          <View style={{ 
                            backgroundColor: activeTab === 'income' ? '#10B981' : '#A855F7', 
                            borderTopLeftRadius: 2, 
                            borderTopRightRadius: 2, 
                            height, 
                            width: 8 
                          }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {chartData.map((data, index) => (
                    <Text key={index} style={{ color: '#9CA3AF', fontSize: 12 }}>
                      {new Date(2025, parseInt(data.month) - 1).toLocaleString('en-US', { month: 'short' })}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          {Object.keys(groupedTransactions).length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>
                  No {activeTab} transactions yet
                </Text>
              </View>
            </View>
          ) : (
            Object.entries(groupedTransactions).map(([date, dateTransactions], dateIndex) => (
              <View key={date} style={{ marginBottom: 24 }}>
                <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>{date}</Text>
                <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
                  {formatCurrency(
                    dateTransactions
                      .filter(t => t.type === activeTab)
                      .reduce((sum, transaction) => sum + transaction.amount, 0)
                  )}
                </Text>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
                  {dateTransactions
                    .filter(t => t.type === activeTab)
                    .map((transaction, index) => {
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
                            ...(index < dateTransactions.filter(t => t.type === activeTab).length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' } : {}),
                          }}
                        >
                          <View style={{ width: 48, height: 48, backgroundColor: category.color, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                            <Text style={{ fontSize: 18 }}>{category.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>{category.name}</Text>
                            <Text style={{ color: '#6B7280', fontSize: 14 }}>{transaction.note || 'No note'}</Text>
                          </View>
                          <Text style={{ color: transaction.type === 'income' ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={{ padding: 12 }}>
            <Home size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 12 }}>
            <CreditCard size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#60A5FA', width: 56, height: 56, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}>
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

export default TransactionsScreen;