import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  Home, 
  Plane, 
  CreditCard, 
  Plus,
  Grid3X3
} from 'lucide-react-native';

// Custom Tab Bar Button Component
// @ts-ignore
const CustomTabBarButton = ({ children, onPress, ...props }) => (
  <TouchableOpacity
    style={styles.customButton}
    onPress={onPress}
    {...props}
  >
    <View style={styles.customButtonInner}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5', // Purple color for active state
        tabBarInactiveTintColor: '#9CA3AF', // Gray color for inactive state
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          borderRadius: 25,
          height: 70,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false, // Hide labels to match the design
        tabBarItemStyle: {
          height: 50,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={24} 
              color={focused ? '#4F46E5' : '#9CA3AF'} 
              fill={focused ? '#4F46E5' : 'transparent'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerButton}>
              <Plus 
                size={28} 
                color="white"
                strokeWidth={3}
              />
            </View>
          ),
          // @ts-ignore
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <CreditCard 
              size={24} 
              color={focused ? '#4F46E5' : '#9CA3AF'}
              fill={focused ? '#4F46E5' : 'transparent'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <Grid3X3 
              size={24} 
              color={focused ? '#4F46E5' : '#9CA3AF'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // @ts-ignore
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea', // Fallback for React Native
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  travelIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981', // Green color
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// import { Tabs } from 'expo-router';
// import { Text } from 'react-native';

// export default function TabLayout() {
//   return (
//     <Tabs>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: () => <Text>Home</Text>,
//         }}
//       />
//       <Tabs.Screen
//         name="add"
//         options={{
//           title: 'Add',
//           tabBarIcon: () => <Text>Add</Text>,
//         }}
//       />
//       <Tabs.Screen
//         name="transactions"
//         options={{
//           title: 'Transactions',
//           tabBarIcon: () => <Text>Transactions</Text>,
//         }}
//       />
//     </Tabs>
//   );
// }