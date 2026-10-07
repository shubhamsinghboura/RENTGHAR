import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarCheck, MessageCircle, Plus } from 'lucide-react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { OwnerStackParamList, OwnerTabParamList } from '../../navigation/types';
import { isPastDay } from '../../core/dates';
import { useAuthStore } from '../../stores/auth.store';
import { useThreads } from '../../stores/chat.store';
import { localOwnerId } from '../../stores/listings';
import { statusOf, useOwnerHomes } from '../../stores/owner-listing.store';
import { useOwnerVisits } from '../../stores/visit.store';
import { OwnerListingCard, showListingMenu } from './OwnerListingCard';

const latestCount = 3;

type OwnerHomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<OwnerTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<OwnerStackParamList>
>;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'Owner';
}

export default function OwnerHome() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OwnerHomeNavigation>();
  const name = useAuthStore(state => state.session?.name ?? '');
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const homes = useOwnerHomes(phone);
  const ownerId = phone ? localOwnerId(phone) : '';
  const chats = useThreads('owner', ownerId).length;
  const waiting = useOwnerVisits(ownerId).filter(visit => visit.status === 'pending' && !isPastDay(visit.day)).length;
  const listed = homes.filter(home => statusOf(home) === 'listed').length;
  const latest = homes.slice(0, latestCount);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}>
        <View style={styles.top}>
          <AppText style={styles.heading}>{firstName(name)}</AppText>
          <View style={styles.rolePill}>
            <AppText style={styles.role}>Owner</AppText>
          </View>
        </View>

        <View style={styles.poster}>
          <View style={styles.glow} />
          <AppText style={styles.count}>{listed}</AppText>
          <AppText style={styles.countLabel}>{listed === 1 ? 'home listed' : 'homes listed'}</AppText>
          <AppText style={styles.fee}>You pay ₹500 only when a tenant moves in.</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a home"
            onPress={() => navigation.navigate('AddHome')}
            style={styles.add}>
            <View style={styles.plus}>
              <Plus color={colors.white} size={20} />
            </View>
            <View style={styles.addCopy}>
              <AppText style={styles.addTitle}>Add a home</AppText>
              <AppText color={colors.textSecondary}>Tenants see it after you list it.</AppText>
            </View>
          </Pressable>
        </View>

        {homes.length > 0 ? (
          <View style={styles.activity}>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Visits')} style={styles.tile}>
              <View style={[styles.tileIcon, waiting > 0 && styles.tileIconOn]}>
                <CalendarCheck color={waiting > 0 ? colors.white : colors.greenDark} size={20} />
              </View>
              <AppText style={styles.tileCount}>{waiting}</AppText>
              <AppText color={colors.textSecondary} style={styles.tileLabel}>
                {waiting === 1 ? 'visit to answer' : 'visits to answer'}
              </AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Inbox')} style={styles.tile}>
              <View style={styles.tileIcon}>
                <MessageCircle color={colors.greenDark} size={20} />
              </View>
              <AppText style={styles.tileCount}>{chats}</AppText>
              <AppText color={colors.textSecondary} style={styles.tileLabel}>
                {chats === 1 ? 'chat with a tenant' : 'chats with tenants'}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {latest.length > 0 ? (
          <View style={styles.list}>
            <View style={styles.listHead}>
              <AppText style={styles.listTitle}>Latest homes</AppText>
              {homes.length > latestCount ? (
                <Pressable accessibilityRole="button" hitSlop={8} onPress={() => navigation.navigate('Properties')}>
                  <AppText color={colors.greenDark} style={styles.link}>
                    See all {homes.length}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
            {latest.map(home => (
              <OwnerListingCard
                key={home.id}
                home={home}
                onOpen={() => navigation.navigate('Preview', { id: home.id })}
                onEdit={() => navigation.navigate('AddHome', { homeId: home.id })}
                onMore={() => showListingMenu(phone, home, () => navigation.navigate('Rented', { homeId: home.id }))}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heading: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
  },
  rolePill: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  role: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.greenDark,
  },
  poster: {
    overflow: 'hidden',
    backgroundColor: colors.navy,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.green,
    opacity: 0.22,
    top: -80,
    right: -50,
  },
  count: {
    fontFamily: fonts.semibold,
    fontSize: 72,
    lineHeight: 80,
    color: colors.white,
  },
  countLabel: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    color: colors.white,
  },
  fee: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.greenLight,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  addTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  activity: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 2,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileIconOn: {
    backgroundColor: colors.greenDark,
  },
  tileCount: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
  },
  tileLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
});
