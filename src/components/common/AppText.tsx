import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography, type TypographyName } from '../../core/theme';

interface Props extends TextProps {
  variant?: TypographyName;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  children,
  ...rest
}: Props) {
  return (
    <Text {...rest} style={[typography[variant], { color, textAlign: align }, style]}>
      {children}
    </Text>
  );
}
