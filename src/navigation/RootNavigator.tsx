import { useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ImageAssets } from '../components/ImageAssets';
import { colors } from '../core/theme';
import { useAuthHydrated } from '../stores/auth.store';
import SplashScreen from '../views/SplashScreen';
import AccountScreen from '../views/auth/AccountScreen';
import OnboardingScreen from '../views/auth/OnboardingScreen';
import OtpScreen from '../views/auth/OtpScreen';
import RoleScreen from '../views/auth/RoleScreen';
import { launchRoute } from './auth-flow';
import { OwnerTabsScreen, TenantTabsScreen } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hydrated = useAuthHydrated();
  const initialRouteName = useRef<keyof RootStackParamList | null>(null);

  if (hydrated && !initialRouteName.current) {
    initialRouteName.current = launchRoute();
  }

  if (!initialRouteName.current) {
    return (
      <View style={styles.splash}>
        <Image source={ImageAssets.splash} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName.current}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Group screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
      </Stack.Group>
      <Stack.Screen name="Role" component={RoleScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Group screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name="TenantTabs" component={TenantTabsScreen} />
        <Stack.Screen name="OwnerTabs" component={OwnerTabsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
