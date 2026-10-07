import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Heart, MapPin, Search } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, radius, spacing } from '../../core/theme';
import type { TenantStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useAllHomes } from '../../stores/listings';
import { useSavedStore, useShortlist } from '../../stores/saved.store';

const baseCities = ['Pune', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad'];
const types = ['Room', 'PG', 'Shared Room', 'Flat', '1 BHK', '2 BHK', '3 BHK', 'Independent House'];

function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name.trim().split(' ')[0];
  return first ? `${hello}, ${first}` : hello;
}

export default function TenantHome({ name }: { name: string }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<TenantStackParamList>>();
  const [city, setCity] = useState('Pune');
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const savedIds = useShortlist(phone);
  const homes = useAllHomes();
  const cities = useMemo(() => [...new Set([...baseCities, ...homes.map(home => home.city)])], [homes]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return homes.filter(home => {
      const cityOk = home.city === city;
      const typeOk = !type || home.type === type;
      const textOk =
        text.length === 0 ||
        home.title.toLowerCase().includes(text) ||
        home.area.toLowerCase().includes(text);
      return cityOk && typeOk && textOk;
    });
  }, [city, homes, query, type]);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.heroTop}>
            <View style={styles.flex}>
              <AppText color={colors.greenLight}>{greeting(name)}</AppText>
              <AppText variant="h2" color={colors.white}>
                Find your place.
              </AppText>
            </View>
            <View style={styles.bell}>
              <Bell color={colors.white} size={20} />
              <View style={styles.dot} />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change city"
            onPress={() => setCitiesOpen(true)}
            style={styles.city}>
            <MapPin color={colors.white} size={16} />
            <AppText color={colors.white}>{city}</AppText>
          </Pressable>
          <View style={styles.search}>
            <Search color={colors.navyLight} size={18} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search area, locality, landmark"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.banner}>
          <AppText style={styles.bannerTitle}>Find rental properties for FREE.</AppText>
          <AppText color={colors.textSecondary}>
            Owners pay ₹500 only when a rental succeeds.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Browse by type</AppText>
          <View style={styles.chips}>
            {types.map(item => {
              const selected = item === type;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setType(selected ? null : item)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <AppText variant="label" color={selected ? colors.navy : colors.textSecondary}>
                    {item}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText style={styles.sectionTitle}>Homes in {city}</AppText>
          <View style={styles.cards}>
            {visible.map(home => (
              <Pressable
                key={home.id}
                accessibilityRole="button"
                accessibilityLabel={home.title}
                onPress={() => navigation.navigate('PropertyDetail', { id: home.id })}
                style={styles.card}>
                <View>
                  <Image source={{ uri: home.images[0] }} style={styles.photo} />
                  <View style={styles.badge}>
                    <AppText variant="label" color={colors.navy}>
                      {home.type}
                    </AppText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={savedIds.includes(home.id) ? 'Remove saved home' : 'Save home'}
                    onPress={() => useSavedStore.getState().toggle(phone, home.id)}
                    style={styles.heart}>
                    <Heart
                      color={savedIds.includes(home.id) ? colors.error : colors.navy}
                      fill={savedIds.includes(home.id) ? colors.error : 'transparent'}
                      size={18}
                    />
                  </Pressable>
                </View>
                <View style={styles.cardBody}>
                  <AppText style={styles.cardTitle} numberOfLines={2}>
                    {home.title}
                  </AppText>
                  <View style={styles.location}>
                    <MapPin color={colors.textSecondary} size={14} />
                    <AppText color={colors.textSecondary} numberOfLines={1}>
                      {home.area}, {home.city}
                    </AppText>
                  </View>
                  <View style={styles.priceRow}>
                    <AppText style={styles.price}>{home.rent}</AppText>
                    <AppText color={colors.textSecondary}>/ month</AppText>
                    <AppText color={colors.textSecondary}>· {home.deposit} deposit</AppText>
                  </View>
                </View>
              </Pressable>
            ))}
            {visible.length === 0 ? (
              <AppText color={colors.textSecondary}>No homes in {city} for this search.</AppText>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <Modal visible={citiesOpen} transparent animationType="fade" onRequestClose={() => setCitiesOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setCitiesOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <AppText style={styles.sectionTitle}>Choose a city</AppText>
            <View style={styles.chips}>
              {cities.map(item => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item === city }}
                  onPress={() => {
                    setCity(item);
                    setCitiesOpen(false);
                  }}
                  style={[styles.chip, item === city && styles.chipSelected]}>
                  <AppText variant="label" color={item === city ? colors.navy : colors.textSecondary}>
                    {item}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.greenLight,
  },
  city: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  search: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  banner: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    marginTop: -spacing.xxl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  section: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.navy,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.navySoft,
    borderColor: colors.navyLight,
  },
  cards: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    height: 180,
    backgroundColor: colors.navySoft,
  },
  badge: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  heart: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  price: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 50, 77, 0.5)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.md,
  },
});
