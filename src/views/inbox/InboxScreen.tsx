import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/common/AppText';
import { PersonPhoto } from '../../components/common/PersonPhoto';
import { colors, fonts, spacing } from '../../core/theme';
import { useAuthStore } from '../../stores/auth.store';
import { useThreads, type ChatSide, type ChatThread } from '../../stores/chat.store';
import { localOwnerId, useAnyHome } from '../../stores/listings';
import { useChatPerson } from './useChatPerson';

export default function InboxScreen({ side, onOpen }: { side: ChatSide; onOpen: (threadId: string) => void }) {
  const insets = useSafeAreaInsets();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const threads = useThreads(side, side === 'tenant' ? phone : phone && localOwnerId(phone));

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
          <AppText style={styles.heading}>Chats</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {side === 'owner' ? 'Reply to tenants about your homes.' : 'Message the owner about a home.'}
          </AppText>
        </View>
        {threads.length > 0 ? (
          <View style={styles.list}>
            {threads.map(thread => (
              <ThreadRow key={thread.id} thread={thread} side={side} onOpen={() => onOpen(thread.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle}>No chats yet.</AppText>
            <AppText color={colors.textSecondary} style={styles.sub}>
              {side === 'owner'
                ? 'When a tenant messages you about a home, it shows here.'
                : 'Open a home and tap Message to talk to the owner.'}
            </AppText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ThreadRow({ thread, side, onOpen }: { thread: ChatThread; side: ChatSide; onOpen: () => void }) {
  const home = useAnyHome(thread.homeId);
  const person = useChatPerson(thread, side);
  const last = thread.messages[thread.messages.length - 1];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${person.name}`} onPress={onOpen} style={styles.row}>
      <View style={styles.avatar}>
        <PersonPhoto uri={person.photo} name={person.name} size={52} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.person}>{person.name}</AppText>
        {person.place ? (
          <AppText color={colors.textSecondary} style={styles.home} numberOfLines={1}>
            {person.place}
          </AppText>
        ) : null}
        {home ? (
          <AppText color={colors.greenDark} style={styles.home} numberOfLines={1}>
            {home.title}
          </AppText>
        ) : null}
        {last ? (
          <AppText color={colors.textSecondary} numberOfLines={2} style={styles.preview}>
            {last.from === side ? `You: ${last.text}` : last.text}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.xl,
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
  list: {
    marginTop: spacing.lg,
  },
  empty: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    marginTop: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  person: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  home: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
