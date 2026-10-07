import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { PersonPhoto } from '../../components/common/PersonPhoto';
import { dateFromIso, formatVisitDay, isPastDay } from '../../core/dates';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { OwnerStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useChatStore } from '../../stores/chat.store';
import { localOwnerId, useAnyHome } from '../../stores/listings';
import { usePersonName } from '../../stores/profile.store';
import { useProfilePhoto } from '../../stores/profile-photo.store';
import { useOwnerVisits, useVisitStore, type VisitRequest } from '../../stores/visit.store';

function byDay(a: VisitRequest, b: VisitRequest) {
  return a.day.localeCompare(b.day);
}

function chatFor(visit: VisitRequest) {
  return useChatStore.getState().open({
    homeId: visit.homeId,
    ownerId: visit.ownerId,
    tenantPhone: visit.phone,
    tenantName: visit.tenantName,
  });
}

function answer(visit: VisitRequest, accepted: boolean) {
  const when = `${formatVisitDay(visit.day)}, ${visit.time.toLowerCase()}`;
  useVisitStore.getState().setStatus(visit.id, accepted ? 'accepted' : 'declined');
  useChatStore
    .getState()
    .send(
      chatFor(visit),
      'owner',
      accepted ? `Your visit is confirmed for ${when}.` : `I can't make ${when}. Please pick another time.`,
    );
}

export default function VisitsScreen({ navigation }: OwnerStackScreenProps<'Visits'>) {
  const insets = useSafeAreaInsets();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const visits = useOwnerVisits(phone ? localOwnerId(phone) : '');
  const waiting = visits.filter(visit => visit.status === 'pending' && !isPastDay(visit.day)).sort(byDay);
  const confirmed = visits.filter(visit => visit.status === 'accepted' && !isPastDay(visit.day)).sort(byDay);

  function openChat(visit: VisitRequest) {
    navigation.navigate('Chat', { threadId: chatFor(visit) });
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.back}>
          <ChevronLeft color={colors.navy} size={26} />
        </Pressable>
        <View style={styles.copy}>
          <AppText style={styles.heading}>Visits</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            Tenants who want to see your homes.
          </AppText>
        </View>

        {waiting.length === 0 && confirmed.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle}>No visits yet.</AppText>
            <AppText color={colors.textSecondary}>When a tenant asks to see a home, it shows here.</AppText>
          </View>
        ) : null}

        {waiting.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Waiting for you</AppText>
            {waiting.map(visit => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onMessage={() => openChat(visit)}
                onAccept={() => answer(visit, true)}
                onDecline={() =>
                  Alert.alert('Decline this visit?', 'The tenant can pick another time.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Decline', style: 'destructive', onPress: () => answer(visit, false) },
                  ])
                }
              />
            ))}
          </View>
        ) : null}

        {confirmed.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Confirmed</AppText>
            {confirmed.map(visit => (
              <VisitCard key={visit.id} visit={visit} onMessage={() => openChat(visit)} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function VisitCard({
  visit,
  onMessage,
  onAccept,
  onDecline,
}: {
  visit: VisitRequest;
  onMessage: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const home = useAnyHome(visit.homeId);
  const name = usePersonName(visit.phone, visit.tenantName);
  const photo = useProfilePhoto(visit.phone);
  const date = dateFromIso(visit.day);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.date, visit.status === 'accepted' && styles.dateOn]}>
          <AppText style={styles.dateWeek}>
            {date ? date.toLocaleDateString('en-IN', { weekday: 'short' }) : ''}
          </AppText>
          <AppText style={styles.dateDay}>{date ? date.getDate() : visit.day}</AppText>
          <AppText style={styles.dateWeek}>
            {date ? date.toLocaleDateString('en-IN', { month: 'short' }) : ''}
          </AppText>
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.person}>
            <PersonPhoto uri={photo || undefined} name={name} size={28} />
            <AppText numberOfLines={1} style={styles.name}>
              {name}
            </AppText>
          </View>
          {home ? (
            <AppText color={colors.greenDark} numberOfLines={1} style={styles.home}>
              {home.title}
            </AppText>
          ) : null}
          <AppText color={colors.textSecondary} style={styles.time}>
            {formatVisitDay(visit.day)} · {visit.time}
          </AppText>
        </View>
      </View>
      {visit.note ? (
        <AppText color={colors.navy} style={styles.note}>
          “{visit.note}”
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Message ${name}`}
          onPress={onMessage}
          style={onAccept ? styles.chat : [styles.action, styles.decline, styles.messageWide]}>
          <MessageCircle color={colors.navy} size={18} />
          {onAccept ? null : <AppText style={styles.declineText}>Message</AppText>}
        </Pressable>
        {onDecline ? (
          <Pressable accessibilityRole="button" onPress={onDecline} style={[styles.action, styles.decline]}>
            <AppText style={styles.declineText}>Decline</AppText>
          </Pressable>
        ) : null}
        {onAccept ? (
          <Pressable accessibilityRole="button" onPress={onAccept} style={[styles.action, styles.accept]}>
            <AppText style={styles.acceptText}>Accept</AppText>
          </Pressable>
        ) : null}
      </View>
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
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.xs,
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
  empty: {
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  date: {
    width: 64,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: 'center',
  },
  dateOn: {
    backgroundColor: colors.greenDark,
  },
  dateWeek: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.white,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.white,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    justifyContent: 'center',
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.navy,
  },
  home: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#F4F7F5',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageWide: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
  },
  accept: {
    backgroundColor: colors.greenDark,
  },
  acceptText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  },
});
