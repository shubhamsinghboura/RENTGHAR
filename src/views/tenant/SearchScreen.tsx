import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MapPin, Search, SlidersHorizontal } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { HomeListing } from '../../data/homes';
import type { TenantStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useAllHomes } from '../../stores/listings';
import { useSavedStore, useShortlist } from '../../stores/saved.store';

const baseCities = ['Pune', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad'];
const types = ['Room', 'PG', 'Shared Room', 'Flat', '1 BHK', '2 BHK', '3 BHK', 'Independent House'];

const rentBands = [
  { id: 'any', label: 'Any rent', min: 0, max: Number.POSITIVE_INFINITY },
  { id: 'under-10', label: 'Under ₹10k', min: 0, max: 10000 },
  { id: '10-25', label: '₹10–25k', min: 10000, max: 25000 },
  { id: 'over-25', label: '₹25k+', min: 25000, max: Number.POSITIVE_INFINITY },
];

function rentValue(rent: string) {
  return Number(rent.replace(/\D/g, ''));
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<TenantStackParamList>>();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All');
  const [type, setType] = useState<string | null>(null);
  const [rent, setRent] = useState(rentBands[0].id);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const savedIds = useShortlist(phone);
  const homes = useAllHomes();
  const cities = useMemo(() => ['All', ...new Set([...baseCities, ...homes.map(home => home.city)])], [homes]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    const band = rentBands.find(item => item.id === rent) ?? rentBands[0];
    return homes.filter(home => {
      const cityOk = city === 'All' || home.city === city;
      const typeOk = !type || home.type === type;
      const amount = rentValue(home.rent);
      const rentOk =
        band.max === Number.POSITIVE_INFINITY ? amount >= band.min : amount >= band.min && amount < band.max;
      const textOk =
        text.length === 0 ||
        home.title.toLowerCase().includes(text) ||
        home.area.toLowerCase().includes(text) ||
        home.city.toLowerCase().includes(text);
      return cityOk && typeOk && rentOk && textOk;
    });
  }, [city, homes, query, rent, type]);

  const rentLabel = rentBands.find(item => item.id === rent)?.label ?? 'Any rent';
  const activeFilters = [city, type, rent === 'any' ? null : rentLabel].filter(Boolean).length;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Search color={colors.greenDark} size={18} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Area, locality, or city"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filters"
            onPress={() => setFiltersOpen(open => !open)}
            style={[styles.filterButton, filtersOpen && styles.filterButtonOn]}>
            <SlidersHorizontal color={filtersOpen ? colors.white : colors.navy} size={18} />
            {activeFilters > 1 ? <View style={styles.filterDot} /> : null}
          </Pressable>
        </View>
        <AppText color={colors.textSecondary} style={styles.count}>
          {visible.length} {visible.length === 1 ? 'result' : 'results'}
          {city !== 'All' ? ` in ${city}` : ''}
        </AppText>
      </View>

      {filtersOpen ? (
        <View style={styles.filters}>
          <FilterLine label="City" items={cities} selected={city} onPress={setCity} />
          <FilterLine
            label="Type"
            items={types}
            selected={type}
            onPress={item => setType(current => (current === item ? null : item))}
          />
          <FilterLine
            label="Rent"
            items={rentBands.map(item => item.label)}
            selected={rentLabel}
            onPress={label => {
              const next = rentBands.find(item => item.label === label);
              if (next) {
                setRent(next.id);
              }
            }}
          />
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {visible.map(home => (
          <ResultRow
            key={home.id}
            home={home}
              saved={savedIds.includes(home.id)}
              onPress={() => navigation.navigate('PropertyDetail', { id: home.id })}
              onSave={() => useSavedStore.getState().toggle(phone, home.id)}
          />
        ))}
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle}>No homes found.</AppText>
            <AppText color={colors.textSecondary}>Try another area, city, or rent.</AppText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function FilterLine({
  label,
  items,
  selected,
  onPress,
}: {
  label: string;
  items: string[];
  selected: string | null;
  onPress: (item: string) => void;
}) {
  return (
    <View style={styles.filterLine}>
      <AppText style={styles.filterLabel}>{label}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {items.map(item => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onPress(item)}
              style={[styles.chip, active && styles.chipSelected]}>
              <AppText variant="label" color={active ? colors.white : colors.navy}>
                {item}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ResultRow({
  home,
  saved,
  onPress,
  onSave,
}: {
  home: HomeListing;
  saved: boolean;
  onPress: () => void;
  onSave: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={home.title} onPress={onPress} style={styles.row}>
      <Image source={{ uri: home.images[0] }} style={styles.thumb} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <AppText style={styles.title} numberOfLines={1}>
            {home.title}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove saved home' : 'Save home'}
            hitSlop={8}
            onPress={onSave}>
            <Heart color={saved ? colors.error : colors.navyLight} fill={saved ? colors.error : 'transparent'} size={18} />
          </Pressable>
        </View>
        <View style={styles.location}>
          <MapPin color={colors.textSecondary} size={13} />
          <AppText color={colors.textSecondary} numberOfLines={1} style={styles.meta}>
            {home.area}, {home.city}
          </AppText>
        </View>
        <AppText color={colors.textSecondary} style={styles.meta}>
          {home.type} · {home.furnishing}
          {home.images.length > 1 ? ` · ${home.images.length} photos` : ''}
        </AppText>
        <AppText style={styles.price}>
          {home.rent}
          <AppText color={colors.textSecondary} style={styles.meta}>
            {' '}
            / month
          </AppText>
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  search: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  filterButtonOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  filters: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#F7F8FA',
  },
  filterLine: {
    gap: spacing.xs,
  },
  filterLabel: {
    paddingHorizontal: spacing.xl,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.greenDark,
    borderColor: colors.greenDark,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    paddingVertical: spacing.huge,
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
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    backgroundColor: colors.navySoft,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.greenDark,
  },
});
