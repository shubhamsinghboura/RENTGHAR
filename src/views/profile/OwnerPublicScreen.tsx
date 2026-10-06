import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, spacing } from '../../core/theme';
import { findHome } from '../../data/homes';
import { findOwner } from '../../data/owners';

export default function OwnerPublicScreen({
  ownerId,
  onBack,
  onOpenHome,
}: {
  ownerId: string;
  onBack: () => void;
  onOpenHome: (homeId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const owner = findOwner(ownerId);
  const listed = owner?.homeIds.map(id => findHome(id)).filter(home => Boolean(home)) ?? [];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onBack} style={styles.back}>
            <ChevronLeft color={colors.navy} size={26} />
          </Pressable>
        </View>

        {owner ? (
          <View style={styles.body}>
            <View style={styles.identity}>
              <Image source={{ uri: owner.photo }} style={styles.photo} accessibilityLabel={owner.name} />
              <View style={styles.identityCopy}>
                <AppText style={styles.name}>{owner.name}</AppText>
                <AppText style={styles.place}>
                  Owner · {owner.area}, {owner.city}
                </AppText>
                <AppText color={colors.textSecondary} style={styles.since}>
                  Listing since {owner.since}
                </AppText>
              </View>
            </View>
            <AppText style={styles.about}>{owner.about}</AppText>

            <AppText style={styles.section}>
              {listed.length === 1 ? 'Home they list' : 'Homes they list'}
            </AppText>
            <View style={styles.homes}>
              {listed.map(home =>
                home ? (
                  <Pressable
                    key={home.id}
                    accessibilityRole="button"
                    accessibilityLabel={home.title}
                    onPress={() => onOpenHome(home.id)}
                    style={styles.home}>
                    <View style={styles.homeCopy}>
                      <AppText style={styles.homeTitle}>{home.title}</AppText>
                      <AppText color={colors.textSecondary} style={styles.homeMeta}>
                        {home.area}, {home.city}
                      </AppText>
                    </View>
                    <AppText style={styles.rent}>{home.rent}</AppText>
                  </Pressable>
                ) : null,
              )}
            </View>
          </View>
        ) : (
          <AppText style={styles.name}>This owner is not available.</AppText>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.navySoft,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
  },
  place: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.greenDark,
  },
  since: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  about: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.navy,
  },
  section: {
    marginTop: spacing.xl,
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  homes: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  home: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  homeCopy: {
    flex: 1,
    gap: 2,
  },
  homeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  homeMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  rent: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.greenDark,
  },
});
