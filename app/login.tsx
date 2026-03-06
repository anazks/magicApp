import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { generateOTP, otpVerificationLogin, googleAuth } from '../api/auth';
import { Mail, Phone, ChevronLeft, ArrowRight } from 'lucide-react-native';

// Initialize Google Sign-In only on native platforms
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  if (Platform.OS !== 'web') {
    const GoogleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSignInModule.GoogleSignin;
    statusCodes = GoogleSignInModule.statusCodes;
    
    GoogleSignin.configure({
      webClientId: '752728323430-rig6042403v1vriivoh0hmffsl3nv4bs.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['profile', 'email'],
      iosClientId: '752728323430-rig6042403v1vriivoh0hmffsl3nv4bs.apps.googleusercontent.com',
    });
  }
} catch (e) {
  console.warn("GoogleSignIn native module not found.");
}

import { useToast } from '../context/ToastContext';

export default function LoginScreen() {
  const { setToken } = useAuth();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const otpInputs = useRef<TextInput[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000) as any;
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      showToast('Error', 'Please enter your email or mobile number.', 'error');
      return;
    }

    setIsLoading(true);
    console.log('Sending OTP request for identifier:', trimmedIdentifier);
    try {
      const response = await generateOTP({ identifier: trimmedIdentifier });
      console.log('Generate OTP response data:', response.data);
      console.log('Generate OTP response status:', response.status);

      const isSuccess = response.status === 200 && (response.data?.success === true || response.data?.OTP);

      if (isSuccess) {
        console.log('OTP success condition met. Transitioning to OTP screen.');
        setIsOTPSent(true);
        setCountdown(60);
        
        // Log OTP for development, but don't show it in the message anymore
        if (response.data?.OTP) {
          console.log('OTP received in response:', response.data.OTP);
        }
        
        showToast('Success', `OTP sent to ${trimmedIdentifier}`, 'success');
      } else {
        const errorMsg = response.data?.message || 'Failed to send OTP';
        console.warn('OTP sending failed:', errorMsg);
        showToast('Error', errorMsg, 'error');
      }
    } catch (error: any) {
      console.error('Send OTP Error Detail:', error.response?.data || error.message);
      const serverMessage = error.response?.data?.message || error.response?.data?.detail;
      showToast('Error', serverMessage || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Error', 'Please enter the complete 6-digit OTP.', 'error');
      return;
    }

    setIsLoading(true);
    const trimmedIdentifier = identifier.trim();
    console.log('Verifying OTP for identifier:', trimmedIdentifier, 'code:', otpCode);
    try {
      const response = await otpVerificationLogin({
        identifier: trimmedIdentifier,
        otp: otpCode,
      });

      console.log('Verify OTP response:', response);

      if (response && response.access) {
        await setToken(response.access);
        showToast('Success', 'Logged in successfully!', 'success');
        router.replace('/(tabs)/Home');
      } else {
        showToast('Error', response?.message || 'Invalid OTP or authentication failed.', 'error');
      }
    } catch (error: any) {
      console.error('Verify OTP Error:', error.response?.data || error.message);
      showToast('Error', error.response?.data?.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      showToast('Not Supported', 'Google Login is only available on native devices.', 'info');
      return;
    }

    if (!GoogleSignin) {
      showToast('Error', 'Google Sign-In is not available in Expo Go.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID token');

      const response = await googleAuth(idToken);
      const { access } = response.data;

      if (access) {
        await setToken(access);
        router.replace('/(tabs)/Home');
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (statusCodes && error.code !== statusCodes.SIGN_IN_CANCELLED) {
        showToast('Login Error', 'Failed to sign in with Google.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            {isOTPSent
              ? `Enter the 6-digit code sent to ${identifier}`
              : 'Sign in to access your history and profile'}
          </Text>
        </View>

        {!isOTPSent ? (
          <View style={styles.form}>
            <View style={styles.inputOuterContainer}>
              <Text style={styles.label}>Email or Mobile</Text>
              <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
                <Mail size={20} color={isFocused ? "#1A4FD6" : "#64748B"} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendOTP}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.primaryButtonText}>Send OTP </Text>
                  <ArrowRight size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpInputs.current[index] = ref!; }}
                  style={[
                    styles.otpInput,
                    focusedIndex === index && styles.otpInputFocused
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOTPChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerifyOTP}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify & Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={countdown > 0 || isLoading}
            >
              <Text style={[styles.resendText, countdown > 0 && styles.disabledText]}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsOTPSent(false)}
            >
              <Text style={styles.linkText}>Change Email/Mobile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F1F5F9',
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EFF6FF',
    opacity: 0.5,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 22,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputOuterContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#1A4FD6',
    backgroundColor: '#FFF',
    shadowColor: '#1A4FD6',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1A4FD6',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: Platform.OS === 'web' ? 45 : 50,
    height: 64,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpInputFocused: {
    borderColor: '#1A4FD6',
    backgroundColor: '#FFF',
  },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: '#1A4FD6',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledText: {
    color: '#94A3B8',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 60,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
  },
});
