import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { colors, fonts, radius, spacing } from '../../core/theme';

import { AppText } from './AppText';

export type DropdownOption = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  error?: string;
};

export function AppDropdown({ label, placeholder = 'Choose', value, options, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);
  const invalid = Boolean(error);

  return (
    <View style={[styles.field, open && styles.raised]}>
      {label ? (
        <AppText variant="label" color={colors.navy}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(current => !current)}
        style={[styles.box, open && styles.focused, invalid && styles.invalid]}>
        <AppText style={[styles.value, !selected && styles.placeholder]}>{selected?.label ?? placeholder}</AppText>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown color={colors.navy} size={20} />
        </View>
      </Pressable>
      {open ? (
        <ScrollView style={styles.menu} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {options.map((option, index) => {
            const active = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.option, index > 0 && styles.optionLine, active && styles.optionOn]}>
                <AppText style={[styles.optionLabel, active && styles.optionLabelOn]}>{option.label}</AppText>
                {active ? <Check color={colors.greenDark} size={18} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      {error ? (
        <AppText variant="label" color={colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  raised: {
    zIndex: 20,
  },
  box: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
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
  value: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  menu: {
    maxHeight: 280,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionLine: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionOn: {
    backgroundColor: colors.greenSoft,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  optionLabelOn: {
    color: colors.greenDark,
  },
});
