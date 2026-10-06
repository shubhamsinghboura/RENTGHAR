import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, spacing } from '../../core/theme';

import { AppText } from './AppText';

type InputRef = ComponentRef<typeof TextInput>;

interface Props extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const AppTextInput = forwardRef<InputRef, Props>(function AppTextInput(
  { label, error, prefix, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const invalid = Boolean(error);

  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="label" color={colors.navy}>
          {label}
        </AppText>
      ) : null}
      <View style={[styles.box, focused && styles.focused, invalid && styles.invalid]}>
        {prefix ? (
          <AppText variant="button" color={colors.navy} style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSecondary}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
          {...rest}
        />
      </View>
      {error ? (
        <AppText variant="label" color={colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  box: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
  },
  focused: {
    borderColor: colors.green,
  },
  invalid: {
    borderColor: colors.error,
  },
  prefix: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
});
