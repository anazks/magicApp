import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
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
import { useToast } from '../context/ToastContext';

export default function FlashScreen() {
  const { token, isLoading: isContextLoading } = useAuth();
  const { showToast } = useToast();
  const floatValue = useSharedValue(0);

  useEffect(() => {
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
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      
      <View style={styles.content}>
        <Animated.View style={animatedLogoStyle}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        
        <View style={styles.textContainer}>
          <GradientText text="Magic Lamp" fontSize={52} width={380} height={80} />
          <Text style={styles.subtitle}>Premium Home Services at Your Fingertips</Text>
          <Text style={styles.description}>
            Experience hassle-free expert care for your home. From cleaning to repairs, 
            we've got you covered with verified professionals.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton} 
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginHighlight}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.footerText}>Version 2.0.0 • Premium Edition</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F8FAFC',
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    padding: 24,
    zIndex: 1,
  },
  logoContainer: {
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: 280,
    height: 180,
    marginBottom: 0,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  getStartedButton: {
    backgroundColor: '#1A4FD6',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  loginHighlight: {
    color: '#1A4FD6',
    fontWeight: '800',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
  }
});