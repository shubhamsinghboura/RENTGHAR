import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, radius } from '../../core/theme';

import { AppText } from './AppText';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GradientButton({ label, onPress, disabled, style }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      style={[styles.press, disabled && styles.disabled, style]}>
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.greenDark} />
              <Stop offset="0.5" stopColor={colors.green} />
              <Stop offset="1" stopColor={colors.greenLight} />
            </LinearGradient>
          </Defs>
          <Rect width={size.width} height={size.height} rx={radius.md} fill="url(#cta)" />
        </Svg>
      ) : null}
      <View style={styles.content}>
        <AppText variant="button" color={colors.white}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    minHeight: 52,
    borderRadius: radius.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
