import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Initialize handler asynchronously so it doesn't crash web bundling
const initNotifications = async () => {
  if (Platform.OS !== 'web') {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      } as any),
    });
  }
};

initNotifications();

export async function registerNotificationListener(callback: (notification: any) => void) {
  if (Platform.OS === 'web') return null;
  const Notifications = await import('expo-notifications');
  return Notifications.addNotificationReceivedListener(callback);
}

export async function registerResponseListener(callback: (response: any) => void) {
  if (Platform.OS === 'web') return null;
  const Notifications = await import('expo-notifications');
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return;

  let token;

  const Notifications = await import('expo-notifications');

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: 5, // max
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A4FD6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      if (!projectId) {
         console.warn('Project ID not found in app config. Skipping Expo Push Token derivation.');
         return;
       }
       
      token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token?.data;
}

// Function to schedule a local notification
export async function scheduleLocalNotification(title: string, body: string, seconds = 2) {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: { 
       seconds 
    } as any,
  });
}
