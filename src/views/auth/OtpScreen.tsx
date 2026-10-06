import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { homeRoute } from '../../navigation/auth-flow';
import type { RootScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';

const OTP_LENGTH = 4;

function formatPhone(phone: string) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export default function OtpScreen({ navigation, route }: RootScreenProps<'Otp'>) {
  const { phone, name, role } = route.params;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => {
      clearTimeout(focusTimer);
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  function changeCode(value: string) {
    const next = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(next);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (next.length === OTP_LENGTH) {
      timer.current = setTimeout(() => {
        useAuthStore.getState().signIn({ name, phone, role });
        navigation.reset({
          index: 0,
          routes: [{ name: homeRoute(role) }],
        });
      }, 180);
    }
  }

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

      <View style={styles.body}>
        <View style={styles.copy}>
          <AppText variant="h1" style={styles.heading}>
            Enter OTP
          </AppText>
          <AppText color={colors.textSecondary} style={styles.subheading}>
            Enter the 4-digit code sent to
          </AppText>
          <AppText style={styles.phone}>{formatPhone(phone)}</AppText>
        </View>

        <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes}>
          {Array.from({ length: OTP_LENGTH }, (_, index) => {
            const digit = code[index] ?? '';
            const active = focused && index === Math.min(code.length, OTP_LENGTH - 1);
            return (
              <View
                key={index}
                pointerEvents="none"
                style={[styles.box, digit ? styles.boxFilled : null, active && styles.boxActive]}>
                <AppText style={styles.digit}>{digit}</AppText>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={changeCode}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={OTP_LENGTH}
            caretHidden
            style={styles.input}
          />
        </Pressable>

        <View style={styles.note}>
          <AppText variant="label"  style={{fontSize:18}} color={colors.navy}>
            Check your messages
          </AppText>
          <AppText color={colors.textSecondary} style={styles.noteBody}>
            The code logs you in as soon as all 4 digits are in.
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resend code"
            hitSlop={8}
            onPress={() => {
              setCode('');
              inputRef.current?.focus();
            }}>
            <AppText variant="body" color={colors.greenDark}>
              Resend code
            </AppText>
          </Pressable>
        </View>
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
  body: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
    fontFamily: fonts.semibold,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
  },
  phone: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.navy,
  },
  boxes: {
    flexDirection: 'row',
    gap: spacing.xxl,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  boxActive: {
    borderColor: colors.green,
  },
  digit: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 26,
    color: colors.navy,
  },
  input: {
    ...StyleSheet.absoluteFill,
    color: 'transparent',
    backgroundColor: 'transparent',
  },
  note: {
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.greenSoft,
  },
  noteBody: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});
