import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ImageAssets } from '../components/ImageAssets';
import { colors } from '../core/theme';
import { homeRoute } from '../navigation/auth-flow';
import type { RootScreenProps } from '../navigation/types';
import { useAuthStore } from '../stores/auth.store';

const SPLASH_HOLD_MS = 1800;

export default function SplashScreen({ navigation }: RootScreenProps<'Splash'>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const session = useAuthStore.getState().session;
      if (session) {
        navigation.reset({ index: 0, routes: [{ name: homeRoute(session.role) }] });
        return;
      }
      navigation.replace('Onboarding');
    }, SPLASH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Image
        source={ImageAssets.splash}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="RentGhar. Find your next home."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
