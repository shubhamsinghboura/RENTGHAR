import { Platform, type TextStyle } from 'react-native';

export const fonts = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semibold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
} as const;

const family = (fontFamily: string): TextStyle => ({
  fontFamily,
  ...Platform.select({
    android: { fontWeight: 'normal' as const },
    default: {},
  }),
});

export const typography = {
  h1: {
    ...family(fonts.bold),
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    ...family(fonts.semibold),
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    ...family(fonts.regular),
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    ...family(fonts.medium),
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    ...family(fonts.semibold),
    fontSize: 16,
    lineHeight: 20,
  },
} as const;

export type TypographyName = keyof typeof typography;
