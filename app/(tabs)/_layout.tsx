import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions, MaterialTopTabNavigationEventMap } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState, useNavigationState } from '@react-navigation/native';
import React from 'react';
import { Platform, Image, View, StyleSheet, Text } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import GradientText from '../../components/GradientText';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const TabHeader = () => {
  const state = useNavigationState(state => state);
  const routeName = state?.routes[state.index]?.name ?? 'Home';

  const getSubtitle = () => {
    switch (routeName) {
      case 'History': return 'My Requests';
      case 'Profile': return 'My Profile';
      default: return null;
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContentWrapper}>
        <View style={styles.headerTitleContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <GradientText text="Magic Lamp" fontSize={22} width={130} height={35} />
        </View>
        {routeName !== 'Home' && (
          <Text style={styles.headerSubtitle}>{getSubtitle()}</Text>
        )}
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <TabHeader />
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: '#1A4FD6',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarShowIcon: true,
          tabBarPressColor: 'rgba(26, 79, 214, 0.1)',
          swipeEnabled: true,
          tabBarIndicatorStyle: { height: 0 },
          tabBarStyle: {
            backgroundColor: '#FFF',
            height: Platform.OS === 'ios' ? 88 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'none',
            marginTop: -2,
          },
        }}>
        <MaterialTopTabs.Screen
          name="Home"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="History"
          options={{
            title: 'History',
            tabBarLabel: 'History',
            tabBarIcon: ({ color }) => <Clock size={22} color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="Profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} />,
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: Platform.OS === 'ios' ? 110 : 75,
    paddingTop: Platform.OS === 'ios' ? 45 : 0,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  }
});
