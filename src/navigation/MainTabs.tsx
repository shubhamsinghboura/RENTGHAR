import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Building2, Heart, House, LayoutDashboard, MessageCircle, Search, UserRound } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, fonts } from '../core/theme';
import { useAuthStore } from '../stores/auth.store';
import ChatScreen from '../views/inbox/ChatScreen';
import InboxScreen from '../views/inbox/InboxScreen';
import EditProfileScreen from '../views/profile/EditProfileScreen';
import OwnerPublicScreen from '../views/profile/OwnerPublicScreen';
import ProfileScreen from '../views/profile/ProfileScreen';
import AddHomeScreen from '../views/owner/AddHomeScreen';
import OwnerHome from '../views/owner/OwnerHome';
import PropertiesScreen from '../views/owner/PropertiesScreen';
import RentedScreen from '../views/owner/RentedScreen';
import VisitsScreen from '../views/owner/VisitsScreen';
import PropertyDetailScreen from '../views/tenant/PropertyDetailScreen';
import SavedScreen from '../views/tenant/SavedScreen';
import SearchScreen from '../views/tenant/SearchScreen';
import TenantHome from '../views/tenant/TenantHome';
import VisitRequestScreen from '../views/tenant/VisitRequestScreen';
import type {
  OwnerStackParamList,
  OwnerStackScreenProps,
  OwnerTabParamList,
  TenantStackParamList,
  TenantStackScreenProps,
  TenantTabParamList,
} from './types';

const TenantTabs = createBottomTabNavigator<TenantTabParamList>();
const TenantStack = createNativeStackNavigator<TenantStackParamList>();
const OwnerTabs = createBottomTabNavigator<OwnerTabParamList>();
const OwnerStack = createNativeStackNavigator<OwnerStackParamList>();

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.greenDark,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
  },
  tabBarLabelStyle: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
};

function icon(Icon: typeof House) {
  return ({ color, size }: { color: string; size: number }) => <Icon color={color} size={size} />;
}

function TenantHomeTab() {
  const name = useAuthStore(state => state.session?.name ?? '');
  return <TenantHome name={name} />;
}

function SearchTab() {
  return <SearchScreen />;
}

function SavedTab() {
  return <SavedScreen />;
}

function TenantInboxTab() {
  const navigation = useNavigation<NativeStackNavigationProp<TenantStackParamList>>();
  return <InboxScreen side="tenant" onOpen={threadId => navigation.navigate('Chat', { threadId })} />;
}

function TenantProfileTab() {
  const navigation = useNavigation<NativeStackNavigationProp<TenantStackParamList>>();
  return <ProfileScreen onEdit={() => navigation.navigate('EditProfile')} />;
}

function TenantPropertyRoute({ navigation, route }: TenantStackScreenProps<'PropertyDetail'>) {
  return (
    <PropertyDetailScreen
      id={route.params.id}
      onBack={() => navigation.goBack()}
      onOpenOwner={ownerId => navigation.navigate('OwnerProfile', { ownerId })}
      onOpenChat={threadId => navigation.navigate('Chat', { threadId })}
      onAskVisit={homeId => navigation.navigate('VisitRequest', { homeId })}
    />
  );
}

function TenantChatScreen({ navigation, route }: TenantStackScreenProps<'Chat'>) {
  return (
    <ChatScreen
      threadId={route.params.threadId}
      side="tenant"
      onBack={() => navigation.goBack()}
      onOpenHome={id => navigation.navigate('PropertyDetail', { id })}
      onOpenOwner={ownerId => navigation.navigate('OwnerProfile', { ownerId })}
    />
  );
}

function TenantEditProfile({ navigation }: TenantStackScreenProps<'EditProfile'>) {
  return <EditProfileScreen onBack={() => navigation.goBack()} />;
}

function OwnerPublicRoute({ navigation, route }: TenantStackScreenProps<'OwnerProfile'>) {
  return (
    <OwnerPublicScreen
      ownerId={route.params.ownerId}
      onBack={() => navigation.goBack()}
      onOpenHome={id => navigation.navigate('PropertyDetail', { id })}
    />
  );
}

function OwnerDashboardTab() {
  return <OwnerHome />;
}

function PropertiesTab() {
  return <PropertiesScreen />;
}

function OwnerInboxTab() {
  const navigation = useNavigation<NativeStackNavigationProp<OwnerStackParamList>>();
  return <InboxScreen side="owner" onOpen={threadId => navigation.navigate('Chat', { threadId })} />;
}

function OwnerProfileTab() {
  const navigation = useNavigation<NativeStackNavigationProp<OwnerStackParamList>>();
  return <ProfileScreen onEdit={() => navigation.navigate('EditProfile')} />;
}

function OwnerChatScreen({ navigation, route }: OwnerStackScreenProps<'Chat'>) {
  return (
    <ChatScreen
      threadId={route.params.threadId}
      side="owner"
      onBack={() => navigation.goBack()}
      onOpenHome={id => navigation.navigate('Preview', { id })}
    />
  );
}

function OwnerPreviewRoute({ navigation, route }: OwnerStackScreenProps<'Preview'>) {
  return (
    <PropertyDetailScreen
      preview
      id={route.params.id}
      onBack={() => navigation.goBack()}
      onEdit={() => navigation.navigate('AddHome', { homeId: route.params.id })}
    />
  );
}

function OwnerEditProfile({ navigation }: OwnerStackScreenProps<'EditProfile'>) {
  return <EditProfileScreen onBack={() => navigation.goBack()} />;
}

function TenantTabNavigator() {
  return (
    <TenantTabs.Navigator screenOptions={tabOptions}>
      <TenantTabs.Screen name="Home" component={TenantHomeTab} options={{ tabBarIcon: icon(House) }} />
      <TenantTabs.Screen name="Search" component={SearchTab} options={{ tabBarIcon: icon(Search) }} />
      <TenantTabs.Screen name="Saved" component={SavedTab} options={{ tabBarIcon: icon(Heart) }} />
      <TenantTabs.Screen name="Inbox" component={TenantInboxTab} options={{ tabBarIcon: icon(MessageCircle) }} />
      <TenantTabs.Screen name="Profile" component={TenantProfileTab} options={{ tabBarIcon: icon(UserRound) }} />
    </TenantTabs.Navigator>
  );
}

function OwnerTabNavigator() {
  return (
    <OwnerTabs.Navigator screenOptions={tabOptions}>
      <OwnerTabs.Screen
        name="Dashboard"
        component={OwnerDashboardTab}
        options={{ tabBarIcon: icon(LayoutDashboard), title: 'Home' }}
      />
      <OwnerTabs.Screen name="Properties" component={PropertiesTab} options={{ tabBarIcon: icon(Building2) }} />
      <OwnerTabs.Screen name="Inbox" component={OwnerInboxTab} options={{ tabBarIcon: icon(MessageCircle) }} />
      <OwnerTabs.Screen name="Profile" component={OwnerProfileTab} options={{ tabBarIcon: icon(UserRound) }} />
    </OwnerTabs.Navigator>
  );
}

export function TenantTabsScreen() {
  return (
    <TenantStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <TenantStack.Screen name="Tabs" component={TenantTabNavigator} />
      <TenantStack.Screen name="PropertyDetail" component={TenantPropertyRoute} />
      <TenantStack.Screen name="Chat" component={TenantChatScreen} />
      <TenantStack.Screen name="OwnerProfile" component={OwnerPublicRoute} />
      <TenantStack.Screen name="VisitRequest" component={VisitRequestScreen} />
      <TenantStack.Screen name="EditProfile" component={TenantEditProfile} />
    </TenantStack.Navigator>
  );
}

export function OwnerTabsScreen() {
  return (
    <OwnerStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <OwnerStack.Screen name="Tabs" component={OwnerTabNavigator} />
      <OwnerStack.Screen name="Chat" component={OwnerChatScreen} />
      <OwnerStack.Screen name="AddHome" component={AddHomeScreen} />
      <OwnerStack.Screen name="Preview" component={OwnerPreviewRoute} />
      <OwnerStack.Screen name="Visits" component={VisitsScreen} />
      <OwnerStack.Screen name="Rented" component={RentedScreen} />
      <OwnerStack.Screen name="EditProfile" component={OwnerEditProfile} />
    </OwnerStack.Navigator>
  );
}
