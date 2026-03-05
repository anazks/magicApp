import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing 
} from 'react-native-reanimated';
import GradientText from '../components/GradientText';

export default function FlashScreen() {
  const { token, isLoading: isContextLoading } = useAuth();
  const floatValue = useSharedValue(0);

  useEffect(() => {
    // Welcome Alert
    Alert.alert(
      "Magic Lamp",
      "Welcome to Magic Lamp! Your one-stop solution for all home services.",
      [{ text: "OK" }]
    );

    // Floating Animation
    floatValue.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // If the user is already authenticated and context finished loading
    if (!isContextLoading && token) {
      // Automatically route to Home tabs
      router.replace('/(tabs)/Home');
    }
  }, [token, isContextLoading]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatValue.value * -15 },
      ],
    };
  });

  const handleGetStarted = () => {
    router.push('/(tabs)/Home');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (isContextLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1A4FD6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={animatedLogoStyle}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <GradientText text="Magic Lamp" fontSize={48} width={350} height={80} />
        
        <Text style={styles.subtitle}>Your one-stop solution for all home services.</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton} 
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={handleLogin}
          >
            <Text style={styles.loginLinkText}>Already have an account? <Text style={{color: '#1A4FD6', fontWeight: 'bold'}}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    padding: 24,
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 60,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  getStartedButton: {
    backgroundColor: '#1A4FD6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  }
});