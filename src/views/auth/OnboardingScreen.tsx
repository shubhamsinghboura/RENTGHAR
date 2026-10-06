import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, MessageCircle, ShieldCheck } from 'lucide-react-native';

import { colors, fonts, spacing } from '../../core/theme';
import { AppText } from '../../components/common/AppText';
import { BrandMark } from '../../components/common/BrandMark';
import { GradientButton } from '../../components/common/GradientButton';
import { ImageAssets } from '../../components/ImageAssets';
import type { RootScreenProps } from '../../navigation/types';

const slides = [
  {
    title: 'Find your place',
    body: 'Search rooms, PGs, and homes directly from owners. No broker in the middle.',
    Icon: House,
  },
  {
    title: 'Talk, visit, decide',
    body: 'Send an inquiry, chat, and request a visit. It stays inside RentGhar, and it is free.',
    Icon: MessageCircle,
  },
  {
    title: 'Free for tenants',
    body: 'Tenants never pay RentGhar. Owners list for free and pay ₹500 only after a successful rental.',
    Icon: ShieldCheck,
  },
];

export default function OnboardingScreen({ navigation }: RootScreenProps<'Onboarding'>) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [bannerBox, setBannerBox] = useState({ width: 0, height: 0 });
  const bannerSize = Math.min(bannerBox.width, bannerBox.height);
  const opacity = useRef(new Animated.Value(1)).current;
  const slide = slides[index];
  const last = index === slides.length - 1;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [index, opacity]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <BrandMark />
      <View style={styles.copy}>
        <AppText variant="h1" style={styles.heading}>
          Find your place
        </AppText>
        <AppText color={colors.textSecondary} style={styles.body}>
          {slide.body}
        </AppText>
      </View>
      <View
        style={styles.bannerWrap}
        onLayout={event => {
          const { width, height } = event.nativeEvent.layout;
          setBannerBox({ width, height });
        }}>
        {bannerSize > 0 ? (
          <Image
            source={ImageAssets.onboardingBanner}
            style={{ width: bannerSize, height: bannerSize }}
            resizeMode="contain"
          />
        ) : null}
      </View>

      <View style={{ paddingBottom: insets.bottom + spacing.lg }}>
        <GradientButton label="Get started" onPress={() => navigation.navigate('Role')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  copy: {
    gap: spacing.lg,
    paddingTop: 20,
  },
  heading: {
    fontSize: 42,
    lineHeight: 55,
    color: colors.navy,
    fontFamily: fonts.semibold,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 32,
  },
  bannerWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
});
