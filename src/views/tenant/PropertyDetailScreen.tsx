import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { findHome } from '../../data/homes';
import { findOwner } from '../../data/owners';
import type { TenantStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useChatStore } from '../../stores/chat.store';
import { useVisit } from '../../stores/visit.store';

export default function PropertyDetailScreen({
  navigation,
  route,
}: TenantStackScreenProps<'PropertyDetail'>) {
  const insets = useSafeAreaInsets();
  const home = findHome(route.params.id);
  const owner = home ? findOwner(home.ownerId) : undefined;
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const visit = useVisit(phone, route.params.id);
  const threadId = useChatStore(state =>
    state.threads.find(thread => thread.side === 'tenant' && thread.ownerId === home?.ownerId)?.id,
  );

  if (!home) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.backPlain}>
          <ChevronLeft color={colors.navy} size={26} />
        </Pressable>
        <AppText style={styles.title}>This home is not available.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <PhotoGallery images={home.images} topInset={insets.top} onBack={() => navigation.goBack()} />

        <View style={styles.body}>
          <View style={styles.badge}>
            <AppText variant="label" color={colors.navy}>
              {home.type}
            </AppText>
          </View>
          <AppText style={styles.title}>{home.title}</AppText>
          <View style={styles.location}>
            <MapPin color={colors.textSecondary} size={16} />
            <AppText color={colors.textSecondary}>
              {home.area}, {home.city}
            </AppText>
          </View>
          {owner ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Owner ${owner.name}`}
              onPress={() => navigation.navigate('OwnerProfile', { ownerId: owner.id })}
              style={styles.ownerLink}>
              <Image source={{ uri: owner.photo }} style={styles.ownerPhoto} accessibilityLabel={owner.name} />
              <View style={styles.ownerCopy}>
                <AppText style={styles.ownerName}>Listed by {owner.name}</AppText>
                <AppText color={colors.textSecondary} style={styles.ownerPlace}>
                  {owner.area}, {owner.city}
                </AppText>
              </View>
            </Pressable>
          ) : null}

          <View style={styles.priceRow}>
            <AppText style={styles.price}>{home.rent}</AppText>
            <AppText color={colors.textSecondary}>/ month</AppText>
          </View>

          <View style={styles.facts}>
            <Fact label="Deposit" value={home.deposit} />
            <Fact label="Furnishing" value={home.furnishing} />
            <Fact label="Available" value={home.available} />
          </View>

          <AppText style={styles.section}>About this home</AppText>
          <AppText color={colors.textSecondary} style={styles.description}>
            {home.description}
          </AppText>

          <View style={styles.note}>
            <AppText style={styles.noteTitle}>Free for tenants</AppText>
            <AppText color={colors.textSecondary}>
              Owners pay ₹500 only when a rental succeeds.
            </AppText>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {threadId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Message owner"
            onPress={() => navigation.navigate('Chat', { threadId })}
            style={styles.message}>
            <AppText style={styles.messageLabel}>Message</AppText>
          </Pressable>
        ) : null}
        <View style={styles.visit}>
          <GradientButton
            label={visit ? 'Visit requested' : 'Ask for a visit'}
            onPress={() => navigation.navigate('VisitRequest', { homeId: home.id })}
          />
        </View>
      </View>
    </View>
  );
}

function PhotoGallery({
  images,
  topInset,
  onBack,
}: {
  images: string[];
  topInset: number;
  onBack: () => void;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (width <= 0) {
      return;
    }
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(current => (current === next ? current : next));
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {images.map((uri, photoIndex) => (
          <Image
            key={`${uri}-${photoIndex}`}
            source={{ uri }}
            style={[styles.photo, { width }]}
            accessibilityLabel={`Photo ${photoIndex + 1} of ${images.length}`}
          />
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={onBack}
        style={[styles.back, { top: topInset + spacing.sm }]}>
        <ChevronLeft color={colors.navy} size={26} />
      </Pressable>
      {many ? (
        <View style={[styles.counter, { top: topInset + spacing.md }]}>
          <AppText style={styles.counterText}>
            {index + 1} / {images.length}
          </AppText>
        </View>
      ) : null}
      {many ? (
        <View style={styles.dots}>
          {images.map((uri, dot) => (
            <View key={`${uri}-${dot}`} style={[styles.dot, dot === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <AppText variant="label" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText style={styles.factValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scroll: {
    flex: 1,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: colors.navySoft,
  },
  counter: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: 'rgba(23, 32, 42, 0.72)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  counterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.white,
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlain: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ownerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navySoft,
  },
  ownerCopy: {
    flex: 1,
    gap: 2,
  },
  ownerName: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  ownerPlace: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.navy,
  },
  facts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fact: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  factValue: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
  section: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
    marginTop: spacing.sm,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  note: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.greenSoft,
    gap: spacing.xs,
  },
  noteTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  message: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
  },
  visit: {
    flex: 1,
  },
});
