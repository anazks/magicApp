import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info as InfoIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onHide: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, onHide }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          text: '#064E3B',
          icon: <CheckCircle2 size={24} color="#10B981" />,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          text: '#7F1D1D',
          icon: <AlertCircle size={24} color="#EF4444" />,
        };
      default:
        return {
          bg: '#EFF6FF',
          border: '#3B82F6',
          text: '#1E3A8A',
          icon: <InfoIcon size={24} color="#3B82F6" />,
        };
    }
  };

  const theme = getTheme();

  useEffect(() => {
    translateY.value = withSpring(0);
    opacity.value = withTiming(1);

    const hideTimeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onHide)(id);
      });
    }, 4000);

    return () => clearTimeout(hideTimeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <View style={styles.iconContainer}>{theme.icon}</View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    opacity: 0.8,
  },
});
