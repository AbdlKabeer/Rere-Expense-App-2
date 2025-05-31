import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Alert } from 'react-native';
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
  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const existingTransactions = await this.getTransactions();
      console.log('Existing transactions:', existingTransactions);
      const updatedTransactions = [transaction, ...existingTransactions];
      console.log('Saving transactions:', updatedTransactions);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  },

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

  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filteredTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  },

  async updateTransaction(updatedTransaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      );
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  },

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      return [];
    }
  },

  async getTotalTransactions(): Promise<number> {
    try {
      const transactions = await this.getTransactions();
      return transactions.reduce((total, transaction) => 
        transaction.type === 'income' ? total + transaction.amount : total - transaction.amount, 0);
    } catch (error) {
      console.error('Error getting total transactions:', error);
      return 0;
    }
  },

  async clearAllTransactions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    } catch (error) {
      console.error('Error clearing transactions:', error);
      throw new Error('Failed to clear transactions');
    }
  },
};

const formatAmount = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

const AddTransactionScreen = () => {
  const [amount, setAmount] = useState('0.00');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState('Today');
  const [isLoading, setIsLoading] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const amountInputRef = useRef<TextInput>(null);

  const generateTransactionId = (): string => {
    return `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.-]/g, '');
    if (cleaned.split('.').length > 2) return;
    setAmount(cleaned);
  };

  const handleAmountBlur = () => {
    setAmount(formatAmount(amount));
    setIsAmountFocused(false);
  };

  const handleIncrement = () => {
    const num = parseFloat(amount) || 0;
    setAmount(formatAmount(num + 1));
  };

  const handleDecrement = () => {
    const num = parseFloat(amount) || 0;
    setAmount(formatAmount(num - 1));
  };

  const validateTransaction = (): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category for this transaction');
      return false;
    }
    return true;
  };

  const debugStorage = async () => {
    try {
      const transactions = await TransactionStorage.getTransactions();
      console.log('All saved transactions:', transactions);
      console.log('Total transactions count:', transactions.length);
      console.log('Latest transaction:', transactions[0]);
    } catch (error) {
      console.error('Debug storage error:', error);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const resetForm = () => {
    setAmount('0.00');
    setSelectedCategory(null);
    setNote('');
    setDate('Today');
    setTransactionType('expense');
  };

  const handleSave = async () => {
    if (!validateTransaction()) return;
    setIsLoading(true);
    try {
      const transaction: Transaction = {
        id: generateTransactionId(),
        amount: parseFloat(amount),
        type: transactionType,
        category: selectedCategory,
        note: note.trim(),
        date: getCurrentDate(),
        timestamp: Date.now(),
      };
      console.log('Saving transaction:', transaction);
      await TransactionStorage.saveTransaction(transaction);
      console.log('Transaction saved successfully!');
      setTimeout(debugStorage, 500);
      showSuccessMessage(`₦${formatAmount(transaction.amount)} ${transactionType} saved successfully!`);
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (error) {
      console.log('Save failed:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
      console.error('Save transaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const transactions = await TransactionStorage.getTransactions();
      console.log('Recent transactions:', transactions.slice(0, 5));
      console.log(`Total saved transactions: ${transactions.length}`);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filteredCategories = transactionType === 'expense' 
    ? categories.filter(cat => !['Salary', 'Gift'].includes(cat.name))
    : categories.filter(cat => ['Salary', 'Gift'].includes(cat.name));

  console.log('Rendering AddTransactionScreen'); // Debug log

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" />
      {showSuccess && (
        <View
          style={{
            position: 'absolute',
            top: 64,
            left: 16,
            right: 16,
            backgroundColor: '#10B981',
            borderRadius: 8,
            padding: 16,
            zIndex: 50,
            flexDirection: 'row',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#FFFFFF',
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 16 }}>✅</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontWeight: '500', flex: 1 }}>{successMessage || 'Transaction saved'}</Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '600' }}>
            Add {transactionType === 'expense' ? 'Expense' : 'Income'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: transactionType === 'expense' ? '#3B82F6' : '#F3F4F6',
                alignItems: 'center',
              }}
              onPress={() => {
                setTransactionType('expense');
                setSelectedCategory(null);
              }}
            >
              <Text style={{ 
                color: transactionType === 'expense' ? '#FFFFFF' : '#374151',
                fontWeight: '600'
              }}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: transactionType === 'income' ? '#10B981' : '#F3F4F6',
                alignItems: 'center',
              }}
              onPress={() => {
                setTransactionType('income');
                setSelectedCategory(null);
              }}
            >
              <Text style={{ 
                color: transactionType === 'income' ? '#FFFFFF' : '#374151',
                fontWeight: '600'
              }}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', fontSize: 16, marginBottom: 16, fontWeight: '500' }}>
              How much?
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ color: '#111827', fontSize: 48, fontWeight: '300' }}>₦</Text>
                <TextInput
                  ref={amountInputRef}
                  style={{
                    color: '#111827',
                    fontSize: 48,
                    fontWeight: '300',
                    textAlign: 'center',
                    marginLeft: 8,
                    minWidth: 192,
                  }}
                  value={amount}
                  onChangeText={handleAmountChange}
                  onBlur={handleAmountBlur}
                  onFocus={() => setIsAmountFocused(true)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: '#F9FAFB',
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                  onPress={handleDecrement}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>➖</Text>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 24 }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
                    Tap amount to edit
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: '#EFF6FF',
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                  }}
                  onPress={handleIncrement}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>➕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              {[100, 500, 1000, 2000, 5000].map(quickAmount => (
                <TouchableOpacity
                  key={quickAmount}
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    marginBottom: 8,
                  }}
                  onPress={() => setAmount(formatAmount(quickAmount))}
                >
                  <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
                    +₦{quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ paddingHorizontal: 0, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 9999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 16 }}>📊</Text>
              </View>
              <Text style={{ color: '#374151', fontWeight: '500' }}>Category</Text>
              {selectedCategory && (
                <Text style={{ color: '#3B82F6', fontSize: 14, marginLeft: 8 }}>
                  ({selectedCategory.name} selected)
                </Text>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={{
                    marginRight: 16,
                    alignItems: 'center',
                    opacity: selectedCategory?.id === category.id ? 1 : 0.6,
                  }}
                  onPress={() => setSelectedCategory(category)}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: category.color,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      ...(selectedCategory?.id === category.id ? { borderWidth: 2, borderColor: '#3B82F6' } : {}),
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{category.icon}</Text>
                  </View>
                  <Text style={{ color: '#374151', fontSize: 14 }}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ paddingHorizontal: 0, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 9999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#4B5563', fontSize: 12 }}>📝</Text>
              </View>
              <Text style={{ color: '#374151', fontWeight: '500' }}>Note</Text>
            </View>
            <TextInput
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#111827',
              }}
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={200}
            />
          </View>
          <View style={{ paddingHorizontal: 0, marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 9999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 16 }}>📅</Text>
              </View>
              <Text style={{ color: '#374151', fontWeight: '500' }}>{getCurrentDate()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, marginBottom: 80 }}>
        <TouchableOpacity
          style={{
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: isLoading ? '#9CA3AF' : showSuccess ? '#10B981' : '#3B82F6',
          }}
          onPress={handleSave}
          disabled={isLoading || showSuccess}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showSuccess && <Text style={{ fontSize: 20, color: '#FFFFFF', marginRight: 8 }}>✅</Text>}
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>
              {isLoading ? 'SAVING...' : showSuccess ? 'SAVED!' : 'SAVE'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;