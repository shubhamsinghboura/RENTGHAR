import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, Check, ChevronLeft, CreditCard, Smartphone } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { OwnerStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useOwnerHomes, useOwnerListingStore } from '../../stores/owner-listing.store';

const methods = [
  { id: 'upi', label: 'UPI', hint: 'Any UPI app', Icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Debit or credit', Icon: CreditCard },
  { id: 'bank', label: 'Net banking', hint: 'All major banks', Icon: Building2 },
] as const;

type Method = (typeof methods)[number]['id'];

export default function RentedScreen({ navigation, route }: OwnerStackScreenProps<'Rented'>) {
  const insets = useSafeAreaInsets();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const home = useOwnerHomes(phone).find(item => item.id === route.params.homeId);
  const [method, setMethod] = useState<Method>('upi');
  const [paid, setPaid] = useState(false);

  if (!home) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <Back onPress={() => navigation.goBack()} />
        <AppText style={styles.heading}>This home is not available.</AppText>
      </View>
    );
  }

  if (paid) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.done}>
          <View style={styles.doneMark}>
            <Check color={colors.white} size={36} strokeWidth={3} />
          </View>
          <AppText style={styles.heading}>Rented out</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {home.title} no longer shows to tenants. You can list it again any time.
          </AppText>
        </View>
        <GradientButton label="Back to your homes" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const cover = home.images?.[0];

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Back onPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.copy}>
          <AppText style={styles.heading}>Mark as rented</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            Pay once. The home leaves search.
          </AppText>
        </View>

        <View style={styles.home}>
          {cover ? <Image source={{ uri: cover }} style={styles.cover} /> : <View style={styles.cover} />}
          <View style={styles.homeCopy}>
            <AppText numberOfLines={1} style={styles.homeTitle}>
              {home.title}
            </AppText>
            <AppText color={colors.textSecondary} numberOfLines={1} style={styles.homeMeta}>
              {home.area}, {home.city}
            </AppText>
            <AppText color={colors.greenDark} style={styles.homeRent}>
              {home.rent} / mo
            </AppText>
          </View>
        </View>

        <View style={styles.bill}>
          <View style={styles.billGlow} />
          <AppText style={styles.billLabel}>Success fee</AppText>
          <AppText style={styles.billAmount}>₹500</AppText>
          <View style={styles.billRows}>
            <BillRow label="Listing the home" value="Free" />
            <BillRow label="Chats and visits" value="Free" />
            <BillRow label="Tenant pays RentGhar" value="₹0" />
          </View>
        </View>

        <View style={styles.methods}>
          <AppText style={styles.label}>Pay with</AppText>
          {methods.map(({ id, label, hint, Icon }) => {
            const selected = id === method;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMethod(id)}
                style={[styles.method, selected && styles.methodOn]}>
                <View style={[styles.methodIcon, selected && styles.methodIconOn]}>
                  <Icon color={selected ? colors.white : colors.navy} size={18} />
                </View>
                <View style={styles.methodCopy}>
                  <AppText style={styles.methodLabel}>{label}</AppText>
                  <AppText color={colors.textSecondary} style={styles.methodHint}>
                    {hint}
                  </AppText>
                </View>
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <GradientButton
          label="Pay ₹500"
          onPress={() => {
            useOwnerListingStore.getState().setStatus(phone, home.id, 'rented');
            setPaid(true);
          }}
        />
      </View>
    </View>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.billRow}>
      <AppText style={styles.billRowLabel}>{label}</AppText>
      <AppText style={styles.billRowValue}>{value}</AppText>
    </View>
  );
}

function Back({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onPress} style={styles.back}>
      <ChevronLeft color={colors.navy} size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7F5',
    paddingHorizontal: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
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
  home: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.navySoft,
  },
  homeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  homeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.navy,
  },
  homeMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  homeRent: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  bill: {
    overflow: 'hidden',
    backgroundColor: colors.navy,
    borderRadius: radius.xxl,
    padding: spacing.xl,
  },
  billGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.green,
    opacity: 0.22,
    top: -90,
    right: -60,
  },
  billLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.greenLight,
  },
  billAmount: {
    fontFamily: fonts.semibold,
    fontSize: 56,
    lineHeight: 64,
    color: colors.white,
  },
  billRows: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    gap: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billRowLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.75)',
  },
  billRowValue: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  methods: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.white,
    padding: spacing.md,
  },
  methodOn: {
    borderColor: colors.greenDark,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconOn: {
    backgroundColor: colors.greenDark,
  },
  methodCopy: {
    flex: 1,
    gap: 2,
  },
  methodLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  methodHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.greenDark,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.greenDark,
  },
  footer: {
    paddingTop: spacing.md,
  },
  done: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  doneMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
