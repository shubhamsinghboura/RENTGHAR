import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { PersonPhoto } from '../../components/common/PersonPhoto';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { useChatStore, type ChatSide } from '../../stores/chat.store';
import { useAnyHome } from '../../stores/listings';
import { useChatPerson } from './useChatPerson';

export default function ChatScreen({
  threadId,
  side,
  onBack,
  onOpenHome,
  onOpenOwner,
}: {
  threadId: string;
  side: ChatSide;
  onBack: () => void;
  onOpenHome?: (homeId: string) => void;
  onOpenOwner?: (ownerId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const thread = useChatStore(state => state.threads.find(item => item.id === threadId));
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const home = useAnyHome(thread?.homeId);
  const person = useChatPerson(thread, side);
  const showProfile = side === 'tenant' && Boolean(onOpenOwner);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [thread?.messages.length]);

  function send() {
    const text = draft.trim();
    if (!text || !thread) {
      return;
    }
    useChatStore.getState().send(thread.id, side, text);
    setDraft('');
  }

  if (!thread) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack}>
          <ChevronLeft color={colors.navy} size={26} />
        </Pressable>
        <AppText style={styles.name}>This chat is not available.</AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onBack} style={styles.back}>
          <ChevronLeft color={colors.navy} size={26} />
        </Pressable>
        <PersonPhoto uri={person.photo} name={person.name} size={44} />
        <View style={styles.headerCopy}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${person.name} profile`}
            disabled={!showProfile}
            onPress={() => onOpenOwner?.(thread.ownerId)}>
            <AppText style={styles.name}>{person.name}</AppText>
            {showProfile ? (
              <AppText color={colors.navyLight} style={styles.profileLink}>
                View profile
              </AppText>
            ) : null}
          </Pressable>
          {home ? (
            <Pressable
              accessibilityRole="button"
              disabled={!onOpenHome}
              onPress={() => onOpenHome?.(home.id)}>
              <AppText color={colors.greenDark} numberOfLines={1} style={styles.home}>
                {home.title} · {home.area}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {thread.messages.length === 0 ? (
          <AppText color={colors.textSecondary} style={styles.start}>
            Say hello and ask about the home.
          </AppText>
        ) : null}
        {thread.messages.map(message => {
          const mine = message.from === side;
          return (
            <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <AppText style={[styles.message, mine && styles.messageMine]}>{message.text}</AppText>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${person.name}`}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={draft.trim().length === 0}
          onPress={send}
          style={[styles.send, draft.trim().length === 0 && styles.sendOff]}>
          <Send color={colors.white} size={18} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
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
  profileLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  thread: {
    flex: 1,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  start: {
    alignSelf: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.navy,
    borderBottomRightRadius: radius.sm,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  messageMine: {
    color: colors.white,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: {
    backgroundColor: colors.navyLight,
  },
});
