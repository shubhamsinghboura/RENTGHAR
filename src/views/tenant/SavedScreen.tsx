import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { findHome, type HomeListing } from '../../data/homes';
import type { TenantStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useSavedStore, useShortlist } from '../../stores/saved.store';

function rentValue(rent: string) {
  return Number(rent.replace(/\D/g, ''));
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<TenantStackParamList>>();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const ids = useShortlist(phone);
  const saved = ids
    .map(id => findHome(id))
    .filter((home): home is HomeListing => Boolean(home))
    .sort((a, b) => rentValue(a.rent) - rentValue(b.rent));
  const cities = [...new Set(saved.map(home => home.city))];
  const cheapest = saved[0]?.rent;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
          <AppText style={styles.kicker}>Saved</AppText>
          <AppText style={styles.heading}>Your shortlist</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            Lined up by rent, cheapest first. Open one when you want the photos.
          </AppText>
          {saved.length > 0 ? (
            <AppText style={styles.summary}>
              {saved.length} {saved.length === 1 ? 'home' : 'homes'}
              {cheapest ? `  ·  from ${cheapest}` : ''}
              {cities.length > 0 ? `  ·  ${cities.join(', ')}` : ''}
            </AppText>
          ) : null}
        </View>

        {saved.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle}>Nothing to compare yet.</AppText>
            <AppText color={colors.textSecondary} style={styles.sub}>
              Heart a home on Home or Search. It stays on this list until you drop it.
            </AppText>
          </View>
        ) : (
          <View style={styles.list}>
            {saved.map((home, index) => (
              <View key={home.id} style={styles.entry}>
                <View style={styles.rail}>
                  <View style={styles.dot} />
                  {index < saved.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={home.title}
                  onPress={() => navigation.navigate('PropertyDetail', { id: home.id })}
                  style={styles.slip}>
                  <View style={styles.slipCopy}>
                    <AppText style={styles.rent}>{home.rent}</AppText>
                    <AppText color={colors.textSecondary} style={styles.per}>
                      / month · {home.deposit} deposit
                    </AppText>
                    <AppText style={styles.title}>{home.title}</AppText>
                    <AppText color={colors.textSecondary} style={styles.place}>
                      {home.type} · {home.area}, {home.city}
                    </AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Drop ${home.title}`}
                      hitSlop={8}
                      onPress={() => useSavedStore.getState().toggle(phone, home.id)}>
                      <AppText style={styles.drop}>Drop</AppText>
                    </Pressable>
                  </View>
                  <Image source={{ uri: home.images[0] }} style={styles.stamp} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.greenDark,
    letterSpacing: 0.4,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.navy,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  summary: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
  empty: {
    marginTop: spacing.xxxl,
    marginHorizontal: spacing.xl,
    paddingLeft: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.navy,
  },
  list: {
    marginTop: spacing.xl,
    paddingRight: spacing.xl,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: 36,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
    marginTop: spacing.lg,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.greenLight,
  },
  slip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  slipCopy: {
    flex: 1,
    gap: 2,
  },
  rent: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.greenDark,
  },
  per: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    marginTop: spacing.xs,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  place: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  drop: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.error,
  },
  stamp: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navySoft,
  },
});
