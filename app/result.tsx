import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  SizableText,
  Card,
  SafeArea,
  Button,
} from '@blinkdotnew/mobile-ui';
import { ArrowLeft, AlertTriangle, CheckCircle2, Sparkles, RotateCcw } from '@tamagui/lucide-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { CredibilityGauge } from '@/components/CredibilityGauge';
import { MetricBar } from '@/components/MetricBar';
import { getTierColor, type Tier } from '@/lib/types';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score: string; tech: string; struct: string; camo: string; coh: string;
    tier: string; summary: string; fluff: string; strengths: string; text: string;
  }>();

  const score = parseInt(params.score || '0', 10);
  const tier = (params.tier || 'Surface-Level Bluffer') as Tier;
  const tierColor = getTierColor(tier);

  const fluffPhrases: string[] = useMemo(() => {
    try { return JSON.parse(params.fluff || '[]'); } catch { return []; }
  }, [params.fluff]);

  const strengths: string[] = useMemo(() => {
    try { return JSON.parse(params.strengths || '[]'); } catch { return []; }
  }, [params.strengths]);

  const text = params.text || '';

  const segments = useMemo(() => {
    if (!fluffPhrases.length) return [{ text, fluff: false }];
    const parts: Array<{ text: string; fluff: boolean }> = [];
    let remaining = text;
    const sorted = [...fluffPhrases].sort((a, b) => b.length - a.length);
    while (remaining.length > 0) {
      let hit: { phrase: string; idx: number } | null = null;
      for (const p of sorted) {
        if (!p || p.length < 3) continue;
        const idx = remaining.toLowerCase().indexOf(p.toLowerCase());
        if (idx !== -1 && (!hit || idx < hit.idx)) hit = { phrase: p, idx };
      }
      if (!hit) { parts.push({ text: remaining, fluff: false }); break; }
      if (hit.idx > 0) parts.push({ text: remaining.slice(0, hit.idx), fluff: false });
      parts.push({ text: remaining.slice(hit.idx, hit.idx + hit.phrase.length), fluff: true });
      remaining = remaining.slice(hit.idx + hit.phrase.length);
    }
    return parts;
  }, [text, fluffPhrases]);

  return (
    <SafeArea flex={1} backgroundColor="$background">
      <XStack paddingHorizontal="$3" paddingTop="$2" paddingBottom="$2" justifyContent="space-between" alignItems="center">
        <Button size="$3" chromeless circular icon={<ArrowLeft size={20} color="$color12" />} onPress={() => router.back()} />
        <SizableText size="$4" fontWeight="700" color="$color12">Analysis Result</SizableText>
        <YStack width={40} />
      </XStack>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          <YStack alignItems="center" paddingTop="$4" paddingBottom="$4">
            <CredibilityGauge score={score} />
          </YStack>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(500)}>
          <YStack alignItems="center" paddingHorizontal="$4" gap="$3" marginBottom="$5">
            <YStack
              backgroundColor={`${tierColor}18`}
              borderWidth={1.5}
              borderColor={tierColor}
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius="$10"
            >
              <SizableText fontSize={14} fontWeight="800" color={tierColor} letterSpacing={1}>
                {tier.toUpperCase()}
              </SizableText>
            </YStack>
            <SizableText size="$3" color="$color11" textAlign="center" paddingHorizontal="$3" lineHeight={22}>
              {params.summary}
            </SizableText>
          </YStack>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(500)}>
          <YStack paddingHorizontal="$4" marginBottom="$5">
            <Card backgroundColor="$color2" borderRadius="$5" padding="$4" gap="$4" borderWidth={1} borderColor="$color4">
              <SizableText size="$4" fontWeight="700" color="$color12">Cognitive Friction Matrix</SizableText>
              <YStack gap="$4">
                <MetricBar label="Technical Specificity" weight="35%" score={parseInt(params.tech || '0', 10)} delay={1100} />
                <MetricBar label="Structural Anchoring" weight="25%" score={parseInt(params.struct || '0', 10)} delay={1250} />
                <MetricBar label="Camouflage Resistance" weight="20%" score={parseInt(params.camo || '0', 10)} delay={1400} />
                <MetricBar label="Logical Coherence" weight="20%" score={parseInt(params.coh || '0', 10)} delay={1550} />
              </YStack>
            </Card>
          </YStack>
        </Animated.View>

        {strengths.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1200).duration(500)}>
            <YStack paddingHorizontal="$4" marginBottom="$4">
              <Card backgroundColor="$color2" borderRadius="$5" padding="$4" gap="$3" borderWidth={1} borderColor="rgba(34,197,94,0.25)">
                <XStack gap="$2" alignItems="center">
                  <CheckCircle2 size={18} color="#22c55e" />
                  <SizableText size="$4" fontWeight="700" color="$color12">Signs of Real Expertise</SizableText>
                </XStack>
                <YStack gap="$2">
                  {strengths.map((s, i) => (
                    <XStack key={i} gap="$2" alignItems="flex-start">
                      <SizableText color="#22c55e" fontWeight="700" lineHeight={20}>•</SizableText>
                      <SizableText size="$3" color="$color11" flex={1} lineHeight={20}>{s}</SizableText>
                    </XStack>
                  ))}
                </YStack>
              </Card>
            </YStack>
          </Animated.View>
        )}

        {fluffPhrases.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1400).duration(500)}>
            <YStack paddingHorizontal="$4" marginBottom="$4">
              <Card backgroundColor="$color2" borderRadius="$5" padding="$4" gap="$3" borderWidth={1} borderColor="rgba(239,68,68,0.25)">
                <XStack gap="$2" alignItems="center">
                  <AlertTriangle size={18} color="#ef4444" />
                  <SizableText size="$4" fontWeight="700" color="$color12">
                    Camouflage Detected ({fluffPhrases.length})
                  </SizableText>
                </XStack>
                <SizableText size="$2" color="$color10">Grammatically dense, information-zero phrases:</SizableText>
                <YStack gap="$2">
                  {fluffPhrases.map((p, i) => (
                    <YStack
                      key={i}
                      backgroundColor="rgba(239,68,68,0.08)"
                      borderLeftWidth={3}
                      borderLeftColor="#ef4444"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius="$2"
                    >
                      <SizableText size="$2" color="$color11" fontStyle="italic" lineHeight={18}>"{p}"</SizableText>
                    </YStack>
                  ))}
                </YStack>
              </Card>
            </YStack>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(1600).duration(500)}>
          <YStack paddingHorizontal="$4" marginBottom="$5">
            <Card backgroundColor="$color2" borderRadius="$5" padding="$4" gap="$3" borderWidth={1} borderColor="$color4">
              <XStack gap="$2" alignItems="center">
                <Sparkles size={16} color="$accent9" />
                <SizableText size="$4" fontWeight="700" color="$color12">
                  Source Text {fluffPhrases.length > 0 && <SizableText size="$2" color="$color9">· red = fluff</SizableText>}
                </SizableText>
              </XStack>
              <YStack>
                <SizableText size="$3" color="$color11" lineHeight={22}>
                  {segments.map((seg, i) => (
                    <SizableText
                      key={i}
                      size="$3"
                      color={seg.fluff ? '#fca5a5' : '$color11'}
                      backgroundColor={seg.fluff ? 'rgba(239,68,68,0.15)' : 'transparent'}
                      lineHeight={22}
                    >
                      {seg.text}
                    </SizableText>
                  ))}
                </SizableText>
              </YStack>
            </Card>
          </YStack>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1800).duration(500)}>
          <YStack paddingHorizontal="$4" gap="$2">
            <Button
              size="$5"
              backgroundColor="$accent9"
              color="$accent1"
              borderRadius="$4"
              icon={<RotateCcw size={18} color="$accent1" />}
              onPress={() => router.replace('/')}
              pressStyle={{ scale: 0.98 }}
              animation="quick"
            >
              Analyze Another
            </Button>
          </YStack>
        </Animated.View>
      </ScrollView>
    </SafeArea>
  );
}
