import logo from '@/assets/images/logo.png';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Index() {
  // Logo animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  // Text animations
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(20)).current;

  // Button animations
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Text color shimmer
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 45,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 820,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Title reveal
    Animated.sequence([
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle reveal
    Animated.sequence([
      Animated.delay(680),
      Animated.parallel([
        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleSlide, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Button reveal
    Animated.sequence([
      Animated.delay(920),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -14,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect on title
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const logoRotateDeg = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '0deg'],
  });

  const yellowLayerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Background arcs */}
      <View style={styles.topArc} />
      <View style={styles.bottomArc} />

      {/* Subtle particles */}
      <View style={styles.particleGrid} pointerEvents="none">
        {Array.from({ length: 36 }).map((_, i) => (
          <View key={i} style={styles.particle} />
        ))}
      </View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { rotate: logoRotateDeg },
              { translateY: logoFloat },
            ],
          },
        ]}
      >
        <View style={styles.logoBadge}>
          <Image source={logo} style={styles.logoImage} />
        </View>
      </Animated.View>

      {/* Title with shimmer */}
      <Animated.View
        style={[
          styles.textBlock,
          { opacity: titleFade, transform: [{ translateY: titleSlide }] },
        ]}
      >
        <View style={styles.titleWrapper}>
          <Text style={[styles.title, { color: '#1A4FD6' }]}>𝓜𝓪𝓰𝓲𝓬𝓛𝓪𝓶𝓹</Text>
          <Animated.Text
            style={[
              styles.title,
              styles.titleOverlay,
              { color: '#F5C518', opacity: yellowLayerOpacity },
            ]}
          >
            𝓜𝓪𝓰𝓲𝓬𝓛𝓪𝓶𝓹
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        style={[
          styles.textBlock,
          { opacity: subtitleFade, transform: [{ translateY: subtitleSlide }] },
        ]}
      >
        <Text style={styles.subtitle}>
          <Text style={styles.subtitleBlue}>Anything</Text>{'  '}
          <Text style={styles.subtitleYellow}>Anywhere.</Text>
          {'\n'}
          <Text style={styles.subtitleBlue}>Anytime for you...!</Text>
        </Text>
      </Animated.View>

      {/* Divider */}
      <Animated.View style={[styles.divider, { opacity: subtitleFade }]}>
        <View style={[styles.dividerLine, { backgroundColor: '#D6E0FF' }]} />
        <Text style={styles.dividerStar}>✧</Text>
        <View style={[styles.dividerLine, { backgroundColor: '#D6E0FF' }]} />
      </Animated.View>

      {/* Button + hint */}
      <Animated.View
        style={[
          { opacity: buttonFade, transform: [{ translateY: buttonSlide }] },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(tabs)/Home')}
            activeOpacity={0.92}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.hint}>No sign-up required • Instant magic</Text>
      </Animated.View>
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

  topArc: {
    position: 'absolute',
    top: -220,
    width: 520,
    height: 380,
    borderRadius: 260,
    backgroundColor: '#EEF2FF',
    alignSelf: 'center',
    opacity: 0.75,
  },
  bottomArc: {
    position: 'absolute',
    bottom: -240,
    width: 460,
    height: 380,
    borderRadius: 230,
    backgroundColor: '#FFFBEA',
    alignSelf: 'center',
    opacity: 0.8,
  },

  particleGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 30,
    paddingVertical: 60,
    gap: 38,
    opacity: 0.22,
  },
  particle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A4FD6',
  },

  logoContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#E8EEFF',
  },
  logoImage: {
    width: 138,
    height: 138,
    resizeMode: 'contain',
  },

  textBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -3,
    textAlign: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 19,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 32,
    color: '#334155',
  },
  subtitleBlue: {
    color: '#1A4FD6',
    fontWeight: '700',
  },
  subtitleYellow: {
    color: '#F5C518',
    fontWeight: '700',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 42,
    width: 210,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerStar: {
    color: '#F5C518',
    fontSize: 16,
    marginHorizontal: 8,
  },

  button: {
    backgroundColor: '#1A4FD6',
    borderRadius: 24,
    paddingHorizontal: 56,
    paddingVertical: 19,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#3A6AFF',
    marginBottom: 14,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  buttonArrow: {
    color: '#F5C518',
    fontSize: 22,
    fontWeight: '700',
  },
  hint: {
    color: '#64748B',
    fontSize: 13.5,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});