import React, { useState } from 'react';
import { TextInput, Platform, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { YStack, XStack, SizableText } from '@blinkdotnew/mobile-ui';
import { Clipboard as ClipboardIcon, Trash2 } from '@tamagui/lucide-icons';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  disabled?: boolean;
}

export function TextAnalyzerInput({ value, onChangeText, disabled }: Props) {
  const [focused, setFocused] = useState(false);
  const chars = value.length;
  const minChars = 20;

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) onChangeText(text);
    } catch {}
  };

  return (
    <YStack
      backgroundColor="$color2"
      borderRadius="$4"
      borderWidth={1}
      borderColor={focused ? '$accent9' : '$color5'}
      padding="$3"
      gap="$2"
      animation="quick"
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Paste an email, pitch, message, or transcript here…"
        placeholderTextColor="rgba(255,255,255,0.35)"
        multiline
        editable={!disabled}
        textAlignVertical="top"
        style={{
          minHeight: 160,
          maxHeight: 280,
          color: '#fff',
          fontSize: 15,
          lineHeight: 22,
          padding: 0,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
        }}
      />
      <XStack justifyContent="space-between" alignItems="center" paddingTop="$2" borderTopWidth={1} borderTopColor="$color4">
        <SizableText size="$1" color={chars >= minChars ? '$accent9' : '$color9'}>
          {chars === 0 ? `${minChars} chars min` : `${chars} characters`}
        </SizableText>
        <XStack gap="$3" alignItems="center">
          {chars > 0 && (
            <Pressable onPress={() => onChangeText('')} hitSlop={8}>
              <XStack gap="$1" alignItems="center">
                <Trash2 size={13} color="$color10" />
                <SizableText size="$1" color="$color10">Clear</SizableText>
              </XStack>
            </Pressable>
          )}
          <Pressable onPress={handlePaste} hitSlop={8}>
            <XStack gap="$1" alignItems="center">
              <ClipboardIcon size={13} color="$accent9" />
              <SizableText size="$1" color="$accent9" fontWeight="600">Paste</SizableText>
            </XStack>
          </Pressable>
        </XStack>
      </XStack>
    </YStack>
  );
}
