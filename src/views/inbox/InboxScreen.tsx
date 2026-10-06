import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { findHome } from '../../data/homes';
import { findOwner } from '../../data/owners';
import { useChatStore, type ChatThread } from '../../stores/chat.store';

export default function InboxScreen({
  side,
  onOpen,
}: {
  side: 'tenant' | 'owner';
  onOpen: (threadId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const threads = useChatStore(state => state.threads).filter(thread => thread.side === side);

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
        <View style={styles.list}>
          {threads.map(thread => (
            <ThreadRow key={thread.id} thread={thread} onOpen={() => onOpen(thread.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ThreadRow({ thread, onOpen }: { thread: ChatThread; onOpen: () => void }) {
  const home = findHome(thread.homeId);
  const owner = thread.ownerId ? findOwner(thread.ownerId) : undefined;
  const last = thread.messages[thread.messages.length - 1];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${thread.person}`} onPress={onOpen} style={styles.row}>
      {owner ? <Image source={{ uri: owner.photo }} style={styles.avatar} /> : <View style={styles.avatar} />}
      <View style={styles.copy}>
        <AppText style={styles.person}>{thread.person}</AppText>
        {owner ? (
          <AppText color={colors.textSecondary} style={styles.home} numberOfLines={1}>
            {owner.area}, {owner.city}
          </AppText>
        ) : null}
        {home ? (
          <AppText color={colors.greenDark} style={styles.home} numberOfLines={1}>
            {home.title}
          </AppText>
        ) : null}
        {last ? (
          <AppText color={colors.textSecondary} numberOfLines={2} style={styles.preview}>
            {last.mine ? `You: ${last.text}` : last.text}
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
    width: 52,
    height: 52,
    marginTop: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.navySoft,
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
