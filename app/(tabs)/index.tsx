import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: { id: number; name: string; icon: string; color: string } | null;
  note: string;
  date: string;
  timestamp: number;
}


const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
};

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

const TestHomeScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const navigation = useNavigation();

  const fetchTransactions = async () => {
    try {
      const fetchedTransactions = await TransactionStorage.getTransactions();
      console.log('Fetched transactions:', fetchedTransactions);
      setTransactions(fetchedTransactions);

      const expensesSum = fetchedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      const incomeSum = fetchedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

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
        {/* Header Section */}
        <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ color: '#6B7280', fontSize: 26, marginBottom: 4 }}>{getGreeting()}</Text>
        </View>

        {/* Balance Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: '#3B82F6', borderRadius: 24, padding: 24, marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Total Balance</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '700', marginBottom: 24 }}>
              {formatCurrency(balance)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 20 }}>⬇️</Text>
                </View>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }}>Income</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{formatCurrency(totalIncome)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 20 }}>⬆️</Text>
                </View>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }}>Expenses</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{formatCurrency(totalExpenses)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700' }}>Transactions</Text>
            <TouchableOpacity onPress={() => {
              // @ts-ignore
              navigation.navigate('transactions')}}>
              <Text style={{ color: '#3B82F6', fontWeight: '500' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
            {transactions.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map((transaction, index) => (
                <View
                  key={transaction.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    ...(index < transactions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' } : {}),
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: transaction.category?.color || '#F3F4F6',
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{transaction.category?.icon || '❓'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>
                      {transaction.category?.name || 'Unknown'}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>{transaction.date}</Text>
                  </View>
                  <Text
                    style={{
                      color: transaction.type === 'income' ? '#10B981' : '#EF4444',
                      fontWeight: '700',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestHomeScreen;