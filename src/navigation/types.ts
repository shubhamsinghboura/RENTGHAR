import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AccountRole } from '../views/auth/RoleScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Role: undefined;
  Account: { role: AccountRole };
  Otp: { role: AccountRole; name: string; phone: string };
  TenantTabs: undefined;
  OwnerTabs: undefined;
};

export type TenantStackParamList = {
  Tabs: undefined;
  PropertyDetail: { id: string };
  Chat: { threadId: string };
  OwnerProfile: { ownerId: string };
  VisitRequest: { homeId: string };
  EditProfile: undefined;
};

export type OwnerStackParamList = {
  Tabs: undefined;
  Chat: { threadId: string };
  AddHome: { homeId?: string } | undefined;
  Preview: { id: string };
  Visits: undefined;
  Rented: { homeId: string };
  EditProfile: undefined;
};

export type TenantTabParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type TenantStackScreenProps<T extends keyof TenantStackParamList> = NativeStackScreenProps<
  TenantStackParamList,
  T
>;

export type OwnerStackScreenProps<T extends keyof OwnerStackParamList> = NativeStackScreenProps<
  OwnerStackParamList,
  T
>;

export type OwnerTabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
