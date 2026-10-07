import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { AppTextInput } from '../../components/common/AppTextInput';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { useAuthStore } from '../../stores/auth.store';
import { useAbout, useProfileStore } from '../../stores/profile.store';

const aboutLimit = 200;

export default function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const savedAbout = useAbout(session?.phone ?? '');
  const [name, setName] = useState(session?.name ?? '');
  const [about, setAbout] = useState(savedAbout);

  if (!session) {
    return null;
  }

  const owner = session.role === 'owner';
  const phone = session.phone;
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const ready = cleanName.length >= 2;

  function save() {
    if (!ready) {
      return;
    }
    useAuthStore.getState().rename(cleanName);
    useProfileStore.getState().save(phone, { name: cleanName, about: owner ? about.trim() : undefined });
    onBack();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onBack} style={styles.back}>
        <ChevronLeft color={colors.navy} size={26} />
      </Pressable>
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.copy}>
          <AppText style={styles.heading}>Edit profile</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {owner ? 'Tenants see this on your homes.' : 'Owners see this when you message.'}
          </AppText>
        </View>

        <AppTextInput
          label="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          error={name.length > 0 && !ready ? 'Enter your name.' : undefined}
        />

        {owner ? (
          <View style={styles.field}>
            <AppText variant="label" color={colors.navy}>
              About you
            </AppText>
            <TextInput
              value={about}
              onChangeText={value => setAbout(value.slice(0, aboutLimit))}
              placeholder="Optional. A line about you and your homes."
              placeholderTextColor={colors.textSecondary}
              multiline
              style={styles.input}
            />
            <AppText color={colors.textSecondary} style={styles.counter}>
              {about.length}/{aboutLimit}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <GradientButton label="Save" disabled={!ready} onPress={save} />
      </View>
    </View>
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
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  copy: {
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 112,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
