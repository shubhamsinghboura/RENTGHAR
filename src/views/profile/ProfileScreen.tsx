import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import { launchCamera, launchImageLibrary, type Asset, type ImagePickerResponse } from 'react-native-image-picker';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, spacing } from '../../core/theme';
import { leaveApp } from '../../navigation/auth-flow';
import { useAuthStore } from '../../stores/auth.store';
import { useProfilePhoto, useProfilePhotoStore } from '../../stores/profile-photo.store';

function formatPhone(phone: string) {
  if (phone.length !== 10) {
    return `+91 ${phone}`;
  }
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function photoFrom(response: ImagePickerResponse) {
  if (response.didCancel) {
    return null;
  }
  if (response.errorCode === 'camera_unavailable') {
    Alert.alert('Camera is not available on this device.');
    return null;
  }
  if (response.errorCode === 'permission') {
    Alert.alert('Allow camera and photo access to add your picture.');
    return null;
  }
  if (response.errorCode) {
    Alert.alert('Could not open that photo. Try another one.');
    return null;
  }
  const asset: Asset | undefined = response.assets?.[0];
  if (!asset) {
    return null;
  }
  if (asset.base64) {
    return `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`;
  }
  return asset.uri ?? null;
}

const pickerOptions = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 800,
  maxHeight: 800,
  includeBase64: true,
  saveToPhotos: false,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const photo = useProfilePhoto(session?.phone ?? '');
  const [busy, setBusy] = useState(false);
  if (!session) {
    return null;
  }

  const parts = session.name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const rest = parts.slice(1).join(' ');
  const owner = session.role === 'owner';
  const phone = session.phone;

  async function saveFrom(source: 'camera' | 'gallery') {
    setBusy(true);
    try {
      const response =
        source === 'camera' ? await launchCamera(pickerOptions) : await launchImageLibrary(pickerOptions);
      const next = photoFrom(response);
      if (next) {
        useProfilePhotoStore.getState().setPhoto(phone, next);
      }
    } finally {
      setBusy(false);
    }
  }

  function choosePhoto() {
    const buttons: { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }[] = [
      { text: 'Take photo', onPress: () => void saveFrom('camera') },
      { text: 'Choose from gallery', onPress: () => void saveFrom('gallery') },
    ];
    if (photo) {
      buttons.push({
        text: 'Remove photo',
        style: 'destructive',
        onPress: () => useProfilePhotoStore.getState().setPhoto(phone, null),
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Your photo', 'Use the camera or pick one from your gallery.', buttons);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.identity}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={busy}
          onPress={choosePhoto}
          style={styles.avatarButton}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <AppText style={styles.initials}>{initials(session.name)}</AppText>
            </View>
          )}
          <View style={styles.camera}>
            <Camera color={colors.white} size={16} />
          </View>
        </Pressable>
        <AppText color={colors.textSecondary} style={styles.hint}>
          Tap your photo to use the camera or gallery.
        </AppText>
        <AppText style={styles.first}>{first}</AppText>
        {rest ? <AppText style={styles.rest}>{rest}</AppText> : null}
        <AppText style={styles.role}>{owner ? 'Owner' : 'Tenant'}</AppText>
        <AppText style={styles.phone}>{formatPhone(session.phone)}</AppText>
        <AppText color={colors.textSecondary} style={styles.line}>
          {owner
            ? 'Listings on this number stay yours. RentGhar takes ₹500 only after a rental.'
            : 'This number is your login. Homes you keep stay with it, and tenants never pay.'}
        </AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" hitSlop={8} onPress={leaveApp} style={styles.signOutButton}>
          <AppText style={styles.signOut}>Sign out</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
  },
  identity: {
    gap: spacing.xs,
  },
  avatarButton: {
    width: 112,
    height: 112,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    lineHeight: 42,
    color: colors.navy,
  },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.greenDark,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  first: {
    fontFamily: fonts.semibold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.navy,
  },
  rest: {
    fontFamily: fonts.regular,
    fontSize: 32,
    lineHeight: 38,
    color: colors.navyLight,
  },
  role: {
    marginTop: spacing.md,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.greenDark,
  },
  phone: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 26,
    color: colors.navy,
  },
  line: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  signOutButton: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
  signOut: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.error,
  },
});
