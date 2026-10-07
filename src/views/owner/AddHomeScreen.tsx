import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, Trash2, X } from 'lucide-react-native';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImagePickerResponse,
} from 'react-native-image-picker';

import { AppDropdown } from '../../components/common/AppDropdown';
import { AppText } from '../../components/common/AppText';
import { AppTextInput } from '../../components/common/AppTextInput';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { cityName, isListedCity, matchCities } from '../../data/cities';
import type { OwnerStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import {
  useOwnerListingStore,
  type OwnerListing,
} from '../../stores/owner-listing.store';

const maxPhotos = 8;

const types = [
  'Room',
  'PG',
  'Shared Room',
  'Flat',
  '1 BHK',
  '2 BHK',
  '3 BHK',
  'Independent House',
].map(item => ({
  label: item,
  value: item,
}));

const furnishings = ['Furnished', 'Semi-furnished', 'Unfurnished'].map(
  item => ({ label: item, value: item }),
);

const pickerOptions: CameraOptions = {
  mediaType: 'photo',
  quality: 0.6,
  maxWidth: 1000,
  maxHeight: 1000,
  includeBase64: true,
  saveToPhotos: false,
};

function availableOptions() {
  const now = new Date();
  const later = Array.from({ length: 3 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index + 1, 1);
    const label = `From 1 ${date.toLocaleDateString('en-IN', {
      month: 'short',
    })}`;
    return { label, value: label };
  });
  return [{ label: 'Available now', value: 'Available now' }, ...later];
}

function digitsOf(amount: string | undefined) {
  return (amount ?? '').replace(/\D/g, '');
}

function formatAmount(digits: string) {
  const amount = Number(digits);
  if (!amount) {
    return '';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function photosFrom(response: ImagePickerResponse) {
  if (response.didCancel) {
    return [];
  }
  if (response.errorCode === 'camera_unavailable') {
    Alert.alert('Camera is not available on this device.');
    return [];
  }
  if (response.errorCode === 'permission') {
    Alert.alert('Allow camera and photo access to add photos.');
    return [];
  }
  if (response.errorCode) {
    Alert.alert('Could not open that photo. Try another one.');
    return [];
  }
  return (response.assets ?? [])
    .map(asset =>
      asset.base64
        ? `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri,
    )
    .filter((uri): uri is string => Boolean(uri));
}

export default function AddHomeScreen({
  navigation,
  route,
}: OwnerStackScreenProps<'AddHome'>) {
  const insets = useSafeAreaInsets();
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const ownerName = useAuthStore(state => state.session?.name ?? '');
  const homeId = route.params?.homeId;
  const [editing] = useState<OwnerListing | undefined>(() =>
    homeId
      ? useOwnerListingStore
          .getState()
          .homes[phone]?.find(listing => listing.id === homeId)
      : undefined,
  );
  const available = useMemo(() => {
    const options = availableOptions();
    const current = editing?.available;
    if (current && !options.some(option => option.value === current)) {
      return [{ label: current, value: current }, ...options];
    }
    return options;
  }, [editing]);
  const [photos, setPhotos] = useState<string[]>(editing?.images ?? []);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<string | null>(editing?.type ?? null);
  const [city, setCity] = useState(editing?.city ?? '');
  const [cityFocused, setCityFocused] = useState(false);
  const [area, setArea] = useState(editing?.area ?? '');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [rent, setRent] = useState(digitsOf(editing?.rent));
  const [deposit, setDeposit] = useState(digitsOf(editing?.deposit));
  const [furnishing, setFurnishing] = useState<string | null>(
    editing?.furnishing ?? null,
  );
  const [from, setFrom] = useState<string | null>(
    editing?.available ?? available[0]?.value ?? null,
  );
  const [description, setDescription] = useState(editing?.description ?? '');
  const chosenCity = cityName(city);
  const suggestions =
    cityFocused && !isListedCity(city) ? matchCities(city) : [];
  const room = maxPhotos - photos.length;
  const ready = Boolean(
    photos.length > 0 &&
      type &&
      chosenCity.length >= 2 &&
      area.trim().length >= 2 &&
      title.trim().length >= 2 &&
      Number(rent) > 0 &&
      deposit.length > 0 &&
      furnishing &&
      from &&
      description.trim().length >= 10,
  );

  async function addFrom(source: 'camera' | 'gallery') {
    if (room <= 0) {
      return;
    }
    setBusy(true);
    try {
      const response =
        source === 'camera'
          ? await launchCamera(pickerOptions)
          : await launchImageLibrary({
              ...pickerOptions,
              selectionLimit: room,
            });
      const next = photosFrom(response);
      if (next.length > 0) {
        setPhotos(current => [...current, ...next].slice(0, maxPhotos));
      }
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!ready || !type || !furnishing || !from) {
      return;
    }
    const home = {
      title: title.trim(),
      city: chosenCity,
      area: area.trim(),
      type,
      rent: formatAmount(rent),
      deposit: formatAmount(deposit) || '₹0',
      furnishing,
      available: from,
      description: description.trim(),
      images: photos,
      ownerName,
    };
    if (editing) {
      useOwnerListingStore.getState().update(phone, editing.id, home);
    } else {
      useOwnerListingStore.getState().add(phone, home);
    }
    navigation.goBack();
  }

  function confirmRemove() {
    if (!editing) {
      return;
    }
    Alert.alert(
      'Remove this home?',
      'Tenants will no longer see it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            useOwnerListingStore.getState().remove(phone, editing.id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  function choosePhotos() {
    Alert.alert('Add photos', 'Use the camera or pick from your gallery.', [
      { text: 'Take photo', onPress: () => addFrom('camera') },
      { text: 'Choose from gallery', onPress: () => addFrom('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => navigation.goBack()}
        style={styles.back}
      >
        <ChevronLeft color={colors.navy} size={26} />
      </Pressable>
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.copy}>
          <AppText style={styles.heading}>
            {editing ? 'Edit home' : 'Add a home'}
          </AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {editing
              ? 'Tenants see the changes as soon as you save.'
              : 'Tenants see this. Nothing is charged now.'}
          </AppText>
        </View>

        <Section
          title="Photos"
          hint={`The first photo is the cover. Up to ${maxPhotos}.`}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
          >
            {room > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add photos"
                disabled={busy}
                onPress={choosePhotos}
                style={[
                  styles.addPhoto,
                  photos.length === 0 && styles.addPhotoWide,
                ]}
              >
                <Camera color={colors.greenDark} size={24} />
                <AppText style={styles.addPhotoLabel}>
                  {photos.length === 0 ? 'Add photos' : 'Add'}
                </AppText>
              </Pressable>
            ) : null}
            {photos.map((uri, index) => (
              <View key={`${index}-${uri.length}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                {index === 0 ? (
                  <View style={styles.cover}>
                    <AppText style={styles.coverText}>Cover</AppText>
                  </View>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  hitSlop={8}
                  onPress={() =>
                    setPhotos(current =>
                      current.filter((_, at) => at !== index),
                    )
                  }
                  style={styles.remove}
                >
                  <X color={colors.white} size={14} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="The home">
          <AppDropdown
            label="Type"
            placeholder="Choose a type"
            value={type}
            options={types}
            onChange={setType}
          />
          <AppTextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Name this home"
          />
          <AppDropdown
            label="Furnishing"
            placeholder="Choose furnishing"
            value={furnishing}
            options={furnishings}
            onChange={setFurnishing}
          />
        </Section>

        <Section title="Where it is">
          <View style={styles.cityField}>
            <AppTextInput
              label="City"
              value={city}
              onChangeText={setCity}
              onFocus={() => setCityFocused(true)}
              onBlur={() => {
                setCityFocused(false);
                setCity(current => cityName(current));
              }}
              placeholder="City name"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {suggestions.length > 0 ? (
              <View style={styles.suggestions}>
                {suggestions.map((name, index) => (
                  <Pressable
                    key={name}
                    accessibilityRole="button"
                    onPressIn={() => setCity(name)}
                    style={[
                      styles.suggestion,
                      index > 0 && styles.suggestionLine,
                    ]}
                  >
                    <AppText style={styles.suggestionLabel}>{name}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <AppTextInput
            label="Area"
            value={area}
            onChangeText={setArea}
            placeholder="Locality"
          />
        </Section>

        <Section title="Rent">
          <View style={styles.pair}>
            <View style={styles.half}>
              <AppTextInput
                label="Per month"
                prefix="₹"
                value={rent}
                onChangeText={value =>
                  setRent(value.replace(/\D/g, '').slice(0, 7))
                }
                placeholder="Amount"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.half}>
              <AppTextInput
                label="Deposit"
                prefix="₹"
                value={deposit}
                onChangeText={value =>
                  setDeposit(value.replace(/\D/g, '').slice(0, 8))
                }
                placeholder="Amount"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <AppDropdown
            label="Available"
            value={from}
            options={available}
            onChange={setFrom}
          />
        </Section>

        <Section title="About this home">
          <TextInput
            value={description}
            onChangeText={value => setDescription(value.slice(0, 400))}
            placeholder="What a tenant should know"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={styles.description}
          />
          <AppText color={colors.textSecondary} style={styles.counter}>
            {description.length} / 400
          </AppText>
        </Section>

        {editing ? (
          <Pressable
            accessibilityRole="button"
            onPress={confirmRemove}
            style={styles.removeHome}
          >
            <Trash2 color={colors.error} size={18} />
            <View style={styles.removeCopy}>
              <AppText style={styles.removeTitle}>Remove this home</AppText>
              <AppText color={colors.textSecondary}>
                Rented it out? Remove it so tenants stop asking.
              </AppText>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}
      >
        <GradientButton
          label={editing ? 'Save changes' : 'List this home'}
          disabled={!ready}
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        {hint ? <AppText color={colors.textSecondary}>{hint}</AppText> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
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
  section: {
    gap: spacing.md,
  },
  sectionHead: {
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  photoRow: {
    gap: spacing.sm,
  },
  addPhoto: {
    width: 104,
    height: 104,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.greenDark,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addPhotoWide: {
    width: 220,
  },
  addPhotoLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.greenDark,
  },
  thumbWrap: {
    width: 104,
    height: 104,
  },
  thumb: {
    width: 104,
    height: 104,
    borderRadius: radius.lg,
    backgroundColor: colors.navySoft,
  },
  cover: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  coverText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    color: colors.white,
  },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(23, 32, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityField: {
    gap: spacing.sm,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  suggestion: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  suggestionLine: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  pair: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  description: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  removeHome: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  removeCopy: {
    flex: 1,
    gap: 2,
  },
  removeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
