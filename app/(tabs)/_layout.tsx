import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Image, View } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import GradientText from '../../components/GradientText';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A4FD6', // Blue color to match MagicLamp
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={{ width: 40, height: 40, marginRight: 8 }} 
                resizeMode="contain" 
              />
              <GradientText text="Magic Lamp" fontSize={24} width={150} height={40} />
            </View>
          ),
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: 'History',
          headerTitle: 'My Requests',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
