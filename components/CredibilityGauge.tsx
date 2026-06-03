import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { SizableText, YStack } from '@blinkdotnew/mobile-ui';
import { getScoreColor } from '@/lib/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
}

export function CredibilityGauge({ score, size = 220 }: Props) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progress = useSharedValue(0);
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    progress.value = 0;
    setDisplayScore(0);
    progress.value = withDelay(
      200,
      withTiming(score, { duration: 1400, easing: Easing.out(Easing.cubic) })
    );
  }, [score]);

  useDerivedValue(() => {
    runOnJS(setDisplayScore)(Math.round(progress.value));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const pct = progress.value / 100;
    return {
      strokeDashoffset: circumference - circumference * pct,
    };
  });

  const color = getScoreColor(score);

  return (
    <YStack alignItems="center" justifyContent="center" position="relative">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SizableText fontSize={56} fontWeight="800" color={color} lineHeight={60}>
          {displayScore}
        </SizableText>
        <SizableText size="$2" color="$color10" marginTop="$1" letterSpacing={1.5}>
          DoK SCORE
        </SizableText>
      </View>
    </YStack>
  );
}
