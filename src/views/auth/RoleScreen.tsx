import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, ChevronLeft, House } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { RootScreenProps } from '../../navigation/types';

export type AccountRole = 'tenant' | 'owner';

const roles: {
  id: AccountRole;
  title: string;
  body: string;
  Icon: typeof House;
}[] = [
  {
    id: 'tenant',
    title: 'Tenant',
    body: 'Find rooms, PGs, and homes from owners. Tenants never pay RentGhar.',
    Icon: House,
  },
  {
    id: 'owner',
    title: 'Owner',
    body: 'List your property for free. Pay ₹500 only after a successful rental.',
    Icon: Building2,
  },
];

export default function RoleScreen({ navigation }: RootScreenProps<'Role'>) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<AccountRole | null>(null);
  const selectedRole = roles.find(role => role.id === selected);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => navigation.goBack()}
        style={styles.back}>
        <ChevronLeft color={colors.navy} size={26} />
      </Pressable>

      <View style={styles.copy}>
        <AppText variant="h1" style={styles.heading}>
          Who are you?
        </AppText>
        <AppText color={colors.textSecondary} style={styles.body}>
          Select Tenant or Owner. RentGhar uses this to set up your account.
        </AppText>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {roles.map(role => {
          const active = role.id === selected;
          const Icon = role.Icon;
          return (
            <Pressable
              key={role.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={role.title}
              onPress={() => setSelected(role.id)}
              style={[styles.card, active && styles.cardSelected]}>
              <View style={[styles.iconWrap, active && styles.iconWrapSelected]}>
                <Icon color={active ? colors.white : colors.greenDark} size={22} />
              </View>
              <View style={styles.cardCopy}>
                <AppText variant="h2" color={colors.navy}>
                  {role.title}
                </AppText>
                <AppText color={colors.textSecondary}>{role.body}</AppText>
              </View>
              <View style={[styles.radio, active && styles.radioSelected]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + spacing.lg }}>
        <GradientButton
          label={selectedRole ? `Continue as ${selectedRole.title}` : 'Continue'}
          disabled={!selectedRole}
          onPress={() => {
            if (selected) {
              navigation.navigate('Account', { role: selected });
            }
          }}
        />
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cardSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
  },
  iconWrapSelected: {
    backgroundColor: colors.green,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.green,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
  },
});
