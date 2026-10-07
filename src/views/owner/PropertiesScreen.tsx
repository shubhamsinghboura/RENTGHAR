import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { OwnerStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { statusOf, useOwnerHomes } from '../../stores/owner-listing.store';
import { OwnerListingCard, showListingMenu } from './OwnerListingCard';

function summary(listed: number, rented: number) {
  const homes = listed === 1 ? '1 home listed' : `${listed} homes listed`;
  return rented > 0 ? `${homes} · ${rented} rented` : homes;
}

export default function PropertiesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<OwnerStackParamList>>();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const all = useOwnerHomes(phone);
  const [query, setQuery] = useState('');
  const homes = useMemo(
    () => [...all.filter(home => statusOf(home) !== 'rented'), ...all.filter(home => statusOf(home) === 'rented')],
    [all],
  );
  const listed = all.filter(home => statusOf(home) === 'listed').length;
  const rented = all.filter(home => statusOf(home) === 'rented').length;

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      return homes;
    }
    return homes.filter(
      home =>
        home.title.toLowerCase().includes(text) ||
        home.area.toLowerCase().includes(text) ||
        home.city.toLowerCase().includes(text) ||
        home.type.toLowerCase().includes(text),
    );
  }, [homes, query]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.head}>
        <View style={styles.headCopy}>
          <AppText style={styles.heading}>Your homes</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {summary(listed, rented)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a home"
          onPress={() => navigation.navigate('AddHome')}
          style={styles.addButton}>
          <Plus color={colors.white} size={22} />
        </Pressable>
      </View>

      {homes.length > 0 ? (
        <View style={styles.search}>
          <Search color={colors.greenDark} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Title, area, city, or type"
            placeholderTextColor={colors.textSecondary}
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={home => home.id}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        renderItem={({ item }) => (
          <OwnerListingCard
            home={item}
            onOpen={() => navigation.navigate('Preview', { id: item.id })}
            onEdit={() => navigation.navigate('AddHome', { homeId: item.id })}
            onMore={() => showListingMenu(phone, item, () => navigation.navigate('Rented', { homeId: item.id }))}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle}>{homes.length === 0 ? 'No homes yet.' : 'No homes match.'}</AppText>
            <AppText color={colors.textSecondary}>
              {homes.length === 0 ? 'Tap + to list your first home.' : 'Try another title, area, or city.'}
            </AppText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  headCopy: {
    flex: 1,
    gap: 2,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  list: {
    flex: 1,
    marginTop: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  empty: {
    paddingTop: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
});
