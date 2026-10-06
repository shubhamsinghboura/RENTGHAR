import { queryClient } from '../providers/query-client';
import { useAuthStore, type Session } from '../stores/auth.store';
import { navigationRef } from './navigation-ref';

const homeByRole = {
  tenant: 'TenantTabs',
  owner: 'OwnerTabs',
} as const;

export function homeRoute(role: Session['role']) {
  return homeByRole[role];
}

export function launchRoute() {
  const session = useAuthStore.getState().session;
  return session ? homeByRole[session.role] : 'Splash';
}

export function leaveApp() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  }
  useAuthStore.getState().signOut();
  queryClient.clear();
}
