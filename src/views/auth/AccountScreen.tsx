import { useRef, useState, type ComponentRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { AppTextInput } from '../../components/common/AppTextInput';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, spacing } from '../../core/theme';
import type { RootScreenProps } from '../../navigation/types';
import type { AccountRole } from './RoleScreen';

const roleTitle: Record<AccountRole, string> = {
  tenant: 'Tenant',
  owner: 'Owner',
};

type Props = RootScreenProps<'Account'>;

function mobileDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function isValidName(name: string) {
  return name.trim().length >= 2;
}

function isValidPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

export default function AccountScreen({ navigation, route }: Props) {
  const { role } = route.params;
  const insets = useSafeAreaInsets();
  const phoneRef = useRef<ComponentRef<typeof AppTextInput>>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });
  const nameReady = isValidName(name);
  const phoneReady = isValidPhone(phone);
  const nameError = touched.name && !nameReady ? 'Enter your name.' : '';
  const phoneError = touched.phone && !phoneReady ? 'Enter a 10-digit mobile number.' : '';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => navigation.goBack()}
        style={styles.back}>
        <ChevronLeft color={colors.navy} size={26} />
      </Pressable>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.copy}>
          <AppText variant="h1" style={styles.heading}>
            Welcome
          </AppText>
          <AppText color={colors.textSecondary} style={styles.body}>
            Enter your name and mobile number.
          </AppText>
          <AppText variant="label" color={colors.greenDark}>
            Continuing as {roleTitle[role]}
          </AppText>
        </View>

        <AppTextInput
          label="Name"
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched(current => ({ ...current, name: true }))}
          placeholder="Your name"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          returnKeyType="next"
          maxLength={40}
          error={nameError}
          onSubmitEditing={() => phoneRef.current?.focus()}
        />

        <AppTextInput
          ref={phoneRef}
          label="Phone number"
          prefix="+91"
          value={phone}
          onChangeText={value => setPhone(mobileDigits(value))}
          onBlur={() => setTouched(current => ({ ...current, phone: true }))}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          maxLength={16}
          error={phoneError}
        />
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + spacing.lg }}>
        <GradientButton
          label="Continue"
          disabled={!nameReady || !phoneReady}
          onPress={() => {
            Keyboard.dismiss();
            navigation.navigate('Otp', { role, name: name.trim(), phone });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
  },
  formContent: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  copy: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  heading: {
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
    fontFamily: fonts.semibold,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
  },
});
