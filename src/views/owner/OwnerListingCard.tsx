import { useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Ellipsis, ImageOff, MapPin, Pencil, Plus } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { statusOf, useOwnerListingStore, type OwnerListing } from '../../stores/owner-listing.store';

const backSlot = 2;
const hiddenSlot = 3;
const slotInput = [0, 1, backSlot, hiddenSlot];
const throwDistance = 180;

type AlertButton = { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void };

function confirmRemoveListing(phone: string, home: OwnerListing) {
  Alert.alert(`Remove ${home.title}?`, 'Tenants will no longer see it. This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Remove',
      style: 'destructive',
      onPress: () => useOwnerListingStore.getState().remove(phone, home.id),
    },
  ]);
}

export function showListingMenu(phone: string, home: OwnerListing, onRented: () => void) {
  const status = statusOf(home);
  const setStatus = useOwnerListingStore.getState().setStatus;
  const buttons: AlertButton[] = [];
  if (status === 'rented') {
    buttons.push({ text: 'List it again', onPress: () => setStatus(phone, home.id, 'listed') });
  } else {
    buttons.push({ text: 'Mark as rented', onPress: onRented });
    buttons.push(
      status === 'hidden'
        ? { text: 'Show to tenants', onPress: () => setStatus(phone, home.id, 'listed') }
        : { text: 'Hide for now', onPress: () => setStatus(phone, home.id, 'hidden') },
    );
  }
  buttons.push({ text: 'Remove home', style: 'destructive', onPress: () => confirmRemoveListing(phone, home) });
  buttons.push({ text: 'Cancel', style: 'cancel' });
  Alert.alert(home.title, statusHints[status], buttons);
}

const statusHints = {
  listed: 'Tenants can see this home.',
  hidden: 'Tenants cannot see this home right now.',
  rented: 'Rented out. Tenants cannot see it.',
};

const statusBadges = {
  hidden: { label: 'Hidden', style: { backgroundColor: colors.navySoft }, color: colors.navy },
  rented: { label: 'Rented', style: { backgroundColor: colors.navy }, color: colors.white },
};

export function OwnerListingCard({
  home,
  onOpen,
  onEdit,
  onMore,
}: {
  home: OwnerListing;
  onOpen: () => void;
  onEdit: () => void;
  onMore: () => void;
}) {
  const images = home.images ?? [];
  const status = statusOf(home);
  const badge = status === 'listed' ? null : statusBadges[status];

  return (
    <View style={styles.card}>
      <View style={badge ? styles.dim : undefined}>
        <PhotoDeck key={`${images.length}-${images[0]?.length ?? 0}`} images={images} onAddMore={onEdit} />
      </View>
      <View style={styles.side}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${home.title}`} onPress={onOpen} style={styles.copy}>
          <View style={styles.typeRow}>
            <AppText numberOfLines={1} style={styles.type}>
              {home.type}
            </AppText>
            {badge ? (
              <View style={[styles.badge, badge.style]}>
                <AppText style={[styles.badgeText, { color: badge.color }]}>{badge.label}</AppText>
              </View>
            ) : null}
          </View>
          <AppText numberOfLines={2} style={styles.title}>
            {home.title}
          </AppText>
          <View style={styles.place}>
            <MapPin color={colors.textSecondary} size={13} />
            <AppText color={colors.textSecondary} numberOfLines={1} style={styles.meta}>
              {home.area}, {home.city}
            </AppText>
          </View>
        </Pressable>
        <View style={[styles.tag, badge && styles.tagOff]}>
          <View style={styles.tagHole} />
          <AppText style={styles.tagText}>{home.rent}</AppText>
          <AppText style={styles.tagUnit}>/ mo</AppText>
        </View>
        <View style={styles.tools}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${home.title}`}
            hitSlop={6}
            onPress={onEdit}
            style={styles.tool}>
            <Pencil color={colors.navy} size={16} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`More for ${home.title}`}
            hitSlop={6}
            onPress={onMore}
            style={styles.tool}>
            <Ellipsis color={colors.navy} size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function slotOf(depth: number) {
  return Math.min(depth, backSlot);
}

function PhotoDeck({ images, onAddMore }: { images: string[]; onAddMore: () => void }) {
  const count = images.length;
  const [top, setTop] = useState(0);
  const topRef = useRef(0);
  const busy = useRef(false);
  const drag = useRef(new Animated.Value(0)).current;
  const still = useRef(new Animated.Value(0)).current;
  const slots = useRef<Animated.Value[]>([]).current;
  while (slots.length < count) {
    slots.push(new Animated.Value(slotOf(slots.length)));
  }

  function settle(direction: number) {
    if (busy.current || count < 2) {
      Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      return;
    }
    busy.current = true;
    const current = topRef.current;
    const moves = slots.slice(0, count).map((slot, photo) => {
      if (photo === current) {
        return Animated.timing(drag, {
          toValue: direction * throwDistance,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
      }
      const depth = (photo - current + count) % count;
      return Animated.timing(slot, {
        toValue: slotOf(depth - 1),
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });
    Animated.parallel(moves).start(() => {
      const next = (current + 1) % count;
      slots[current].setValue(hiddenSlot);
      drag.setValue(0);
      topRef.current = next;
      setTop(next);
      Animated.timing(slots[current], {
        toValue: slotOf(count - 1),
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        busy.current = false;
      });
    });
  }

  const settleRef = useRef(settle);
  settleRef.current = settle;
  const dragging = useRef(false);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        dragging.current = false;
      },
      onPanResponderTerminationRequest: () => !dragging.current,
      onPanResponderMove: (_, gesture) => {
        if (!dragging.current && Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          dragging.current = true;
        }
        if (dragging.current && !busy.current) {
          drag.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (!dragging.current) {
          if (Math.abs(gesture.dx) < 6 && Math.abs(gesture.dy) < 6) {
            settleRef.current(1);
          }
          return;
        }
        dragging.current = false;
        const thrown = Math.abs(gesture.dx) > 50 || Math.abs(gesture.vx) > 0.4;
        if (thrown) {
          settleRef.current(gesture.dx < 0 ? -1 : 1);
        } else {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
        Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  if (count < 2) {
    return (
      <View style={styles.deck}>
        <View style={styles.stack}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add more photos"
            onPress={onAddMore}
            style={[styles.layer, styles.ghost]}>
            <Plus color={colors.greenDark} size={16} />
          </Pressable>
          <View
            style={[styles.polaroid, styles.layer, styles.front, count === 0 && styles.polaroidEmpty]}
            pointerEvents="none">
            {count === 1 ? (
              <Image source={{ uri: images[0] }} style={styles.photo} fadeDuration={0} />
            ) : (
              <ImageOff color={colors.navyLight} size={24} />
            )}
          </View>
        </View>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAddMore} style={styles.addMore}>
          <Plus color={colors.greenDark} size={13} />
          <AppText style={styles.addMoreText}>{count === 0 ? 'Add photos' : 'Add more'}</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={count > 1 ? `Photo ${top + 1} of ${count}. Tap or swipe for the next photo.` : 'Photo'}
      onAccessibilityTap={() => settle(1)}
      style={styles.deck}
      {...pan.panHandlers}>
      <View style={styles.stack}>
        {images.map((uri, photo) => {
          const slot = slots[photo];
          const lifted = photo === top;
          const pull = lifted ? drag : still;
          const depth = (photo - top + count) % count;
          return (
            <Animated.View
              key={photo}
              pointerEvents="none"
              style={[
                styles.polaroid,
                styles.layer,
                {
                  zIndex: count - depth,
                  opacity: Animated.multiply(
                    slot.interpolate({ inputRange: slotInput, outputRange: [1, 1, 1, 0], extrapolate: 'clamp' }),
                    pull.interpolate({
                      inputRange: [-throwDistance, -60, 0, 60, throwDistance],
                      outputRange: [0, 1, 1, 1, 0],
                      extrapolate: 'clamp',
                    }),
                  ),
                  transform: [
                    {
                      translateX: Animated.add(
                        slot.interpolate({ inputRange: slotInput, outputRange: [0, 10, -8, -8], extrapolate: 'clamp' }),
                        pull,
                      ),
                    },
                    {
                      rotate: slot.interpolate({
                        inputRange: slotInput,
                        outputRange: ['0deg', '7deg', '-8deg', '-8deg'],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotate: pull.interpolate({
                        inputRange: [-throwDistance, 0, throwDistance],
                        outputRange: ['-16deg', '0deg', '16deg'],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: slot.interpolate({
                        inputRange: slotInput,
                        outputRange: [1, 0.97, 0.94, 0.94],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}>
              <Image source={{ uri }} style={styles.photo} fadeDuration={0} />
            </Animated.View>
          );
        })}
      </View>
      <AppText color={colors.textSecondary} style={styles.deckLabel}>
        {count > 1 ? `${top + 1} of ${count} · swipe` : '1 photo'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  deck: {
    width: 118,
    alignItems: 'center',
    gap: spacing.sm,
  },
  stack: {
    width: 118,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
  polaroid: {
    width: 100,
    padding: 5,
    paddingBottom: 18,
    borderRadius: 6,
    backgroundColor: colors.white,
    shadowColor: '#17202A',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  polaroidEmpty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navySoft,
  },
  front: {
    transform: [{ translateX: -12 }],
  },
  ghost: {
    width: 100,
    height: 119,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.greenDark,
    backgroundColor: colors.greenSoft,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
    transform: [{ translateX: 8 }, { rotate: '4deg' }],
  },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addMoreText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.greenDark,
  },
  photo: {
    width: 90,
    height: 96,
    borderRadius: 3,
    backgroundColor: colors.navySoft,
  },
  deckLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  side: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
  },
  copy: {
    gap: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  type: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.greenDark,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
  },
  dim: {
    opacity: 0.55,
  },
  tagOff: {
    backgroundColor: colors.navyLight,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: 6,
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    backgroundColor: colors.greenDark,
    transform: [{ rotate: '-3deg' }],
  },
  tagHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  tagText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  },
  tagUnit: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.greenSoft,
  },
  tools: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 'auto',
  },
  tool: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
