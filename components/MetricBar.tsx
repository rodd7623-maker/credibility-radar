import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { XStack, YStack, SizableText } from '@blinkdotnew/mobile-ui';
import { getScoreColor } from '@/lib/types';

interface Props {
  label: string;
  score: number;
  weight: string;
  delay?: number;
}

export function MetricBar({ label, score, weight, delay = 0 }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = 0;
    width.value = withDelay(
      delay,
      withTiming(score, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [score, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const color = getScoreColor(score);

  return (
    <YStack gap="$2" width="100%">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center">
          <SizableText size="$3" color="$color12" fontWeight="600">
            {label}
          </SizableText>
          <SizableText size="$1" color="$color9">
            {weight}
          </SizableText>
        </XStack>
        <SizableText size="$4" fontWeight="700" color={color}>
          {score}
        </SizableText>
      </XStack>
      <YStack
        height={8}
        backgroundColor="rgba(255,255,255,0.06)"
        borderRadius={4}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: 4,
            },
            animatedStyle,
          ]}
        />
      </YStack>
    </YStack>
  );
}
