import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Mask,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface GradientTextProps {
  text: string;
  fontSize?: number;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontWeight?: "bold" | "normal" | "600" | "700" | "800" | "900";
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize = 40,
  width = 300,
  height = 80,
  fontWeight = "900",
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      x: interpolate(rotation.value, [0, 1], [-width, 0]),
    };
  });

  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1e40af" />
            <Stop offset="25%" stopColor="#2563eb" />
            <Stop offset="40%" stopColor="#3b82f6" />
            <Stop offset="60%" stopColor="#f59e0b" />
            <Stop offset="75%" stopColor="#fbbf24" />
            <Stop offset="100%" stopColor="#d97706" />
          </LinearGradient>

          <Mask id="textMask">
            <SvgText
              x="50%"
              y="50%"
              fontSize={fontSize}
              fontWeight={fontWeight}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="white"
            >
              {text}
            </SvgText>
          </Mask>
        </Defs>

        {/* This rect handles the animation by moving across the mask */}
        <AnimatedRect
          animatedProps={animatedProps}
          y="0"
          width={width * 2}
          height={height}
          fill="url(#magicGradient)"
          mask="url(#textMask)"
        />
      </Svg>
    </View>
  );
};

export default GradientText;
