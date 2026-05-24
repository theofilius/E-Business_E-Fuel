import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          display: Platform.OS === 'web' ? 'none' : 'flex',
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null, // hides it from tab bar but registers the route
        }}
      />


      <Tabs.Screen
        name="syarat"
        options={{
          href: null, // hides it from tab bar but registers the route
        }}
      />


      <Tabs.Screen
        name="area-layanan"
        options={{
          title: 'Area Layanan',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tentang"
        options={{
          title: 'Tentang E-FUEL',
          tabBarIcon: ({ color }) => <FontAwesome5 name="gas-pump" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="faq"
        options={{
          title: 'FAQs',
          tabBarIcon: ({ color }) => <FontAwesome5 name="question" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
