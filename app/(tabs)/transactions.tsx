import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

// Storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions-1',
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

interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  icon: string;
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
    const parsedDate = new Date(dateStr.replace(/,/, ''));
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date string: ${dateStr}`);
      return dateStr;
    }
    const today = new Date();
    const isToday = parsedDate.toDateString() === today.toDateString();
    const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === parsedDate.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return parsedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return dateStr;
  }
};

const formatDateRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

// Helper function to create pie chart paths
const createPieSlice = (startAngle: number, endAngle: number, radius: number, color: string) => {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = 100 + radius * Math.cos(startRad);
  const y1 = 100 + radius * Math.sin(startRad);
  const x2 = 100 + radius * Math.cos(endRad);
  const y2 = 100 + radius * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return (
    <Path
      d={`M100,100 L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
      fill={color}
    />
  );
};

const TransactionsScreen = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [dateRange, setDateRange] = useState('');
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [averageTransaction, setAverageTransaction] = useState(0);
  const [topCategory, setTopCategory] = useState<CategoryBreakdown | null>(null);

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

      // Category Breakdown
      const categorySums: { [key: string]: { amount: number; color: string; icon: string } } = {};
      filteredTransactions
        .filter(t => t.type === activeTab)
        .forEach(transaction => {
          const catId = transaction.category?.id || 0;
          const category = categories.find(c => c.id === catId) || { name: 'Unknown', color: '#F3F4F6', icon: '❓' };
          if (!categorySums[category.name]) {
            categorySums[category.name] = { amount: 0, color: category.color, icon: category.icon };
          }
          categorySums[category.name].amount += transaction.amount;
        });

      const breakdown = Object.entries(categorySums).map(([name, data]) => ({
        name,
        amount: data.amount,
        color: data.color,
        icon: data.icon,
      }));
      setCategoryBreakdown(breakdown);

      // Average Transaction
      const tabTransactions = filteredTransactions.filter(t => t.type === activeTab);
      const avg = tabTransactions.length > 0 ? tabTransactions.reduce((sum, t) => sum + t.amount, 0) / tabTransactions.length : 0;
      setAverageTransaction(avg);

      // Top Category
      const top = breakdown.length > 0 ? breakdown.reduce((max, cat) => (cat.amount > max.amount ? cat : max)) : null;
      setTopCategory(top);

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
      console.log('Category breakdown:', breakdown);
      console.log('Average transaction:', avg);
      console.log('Top category:', top);
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
    }, [activeTab])
  );

  const maxIncome = Math.max(...chartData.map(d => d.income || 0), 1);
  const maxExpense = Math.max(...chartData.map(d => d.expense || 0), 1);
  const maxValue = Math.max(maxIncome, maxExpense);

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = formatDate(transaction.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {} as { [key: string]: Transaction[] });

  console.log('Rendering TransactionsScreen');
  console.log('Grouped transactions:', groupedTransactions);

  // Calculate pie chart slices
  const totalAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
  let currentAngle = 0;
  const pieSlices = categoryBreakdown.map(cat => {
    const percentage = totalAmount > 0 ? (cat.amount / totalAmount) * 360 : 0;
    const slice = {
      startAngle: currentAngle,
      endAngle: currentAngle + percentage,
      color: cat.color,
    };
    currentAngle += percentage;
    return slice;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700' }}>Transactions</Text>
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
                            width: 8,
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
        {/* Insights Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Insights</Text>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 }}>
            {/* Net Cash Flow */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Net Cash Flow</Text>
              <Text style={{ color: totalIncome - totalExpenses >= 0 ? '#10B981' : '#EF4444', fontSize: 18, fontWeight: '700' }}>
                {formatCurrency(totalIncome - totalExpenses)}
              </Text>
            </View>
            {/* Average Transaction */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Average {activeTab} Transaction</Text>
              <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700' }}>
                {formatCurrency(averageTransaction)}
              </Text>
            </View>
            {/* Top Category */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Top {activeTab} Category</Text>
              {topCategory ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 32, height: 32, backgroundColor: topCategory.color, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                    <Text style={{ fontSize: 16 }}>{topCategory.icon}</Text>
                  </View>
                  <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700' }}>
                    {topCategory.name} ({formatCurrency(topCategory.amount)})
                  </Text>
                </View>
              ) : (
                <Text style={{ color: '#6B7280', fontSize: 16 }}>No data</Text>
              )}
            </View>
            {/* Category Breakdown Pie Chart */}
            <View>
              <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>{activeTab} by Category</Text>
              {categoryBreakdown.length === 0 ? (
                <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#6B7280' }}>No category data available</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Svg width={200} height={200}>
                    {pieSlices.map((slice, index) => (
                      <React.Fragment key={index}>
                        {createPieSlice(slice.startAngle, slice.endAngle, 90, slice.color)}
                      </React.Fragment>
                    ))}
                    <Path
                      d="M100,100 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0"
                      fill="#FFFFFF"
                    />
                  </Svg>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }}>
                    {categoryBreakdown.map((cat, index) => (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: 4 }}>
                        <View style={{ width: 16, height: 16, backgroundColor: cat.color, borderRadius: 4, marginRight: 8 }} />
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>
                          {cat.name}: {((cat.amount / (activeTab === 'income' ? totalIncome : totalExpenses) * 100) || 0).toFixed(1)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        {/* Transactions Section */}
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
                    dateTransactions.filter(t => t.type === activeTab).reduce((sum, transaction) => sum + transaction.amount, 0)
                  )}
                </Text>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, paddingBottom: 56 }}>
                  {dateTransactions.filter(t => t.type === activeTab).map((transaction, index) => {
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
    </SafeAreaView>
  );
};

export default TransactionsScreen;