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
import { Mail, Phone, ChevronLeft } from 'lucide-react-native';

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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            {isOTPSent
              ? `Enter the 6-digit code sent to ${identifier}`
              : 'Sign in to access your history and profile'}
          </Text>
        </View>

        {!isOTPSent ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email or Mobile Number"
                placeholderTextColor="#999"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpInputs.current[index] = ref!; }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOTPChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerifyOTP}
              disabled={isLoading}
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
  backButton: {
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#1A4FD6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A4FD6',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#1A4FD6',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
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
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 56,
    backgroundColor: '#F8FAFC',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
