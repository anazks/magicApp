import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { registerForPushNotificationsAsync, registerNotificationListener, registerResponseListener } from '../services/notifications';
import { Platform } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isSubscribed = true;

    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      console.log('Push Token Derived:', token);

      const notifSub = await registerNotificationListener(notification => {
        console.log('Notification Received:', notification);
      });
      
      const respSub = await registerResponseListener(response => {
        console.log('User tapped Notification:', response);
      });

      if (isSubscribed) {
         notificationListener.current = notifSub;
         responseListener.current = respSub;
      } else {
         notifSub?.remove();
         respSub?.remove();
      }
    };

    setupNotifications();

    return () => {
      isSubscribed = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <ToastProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ToastProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
