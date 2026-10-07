import type { ChatSide, ChatThread } from '../../stores/chat.store';
import { useOwner } from '../../stores/listings';
import { usePersonName } from '../../stores/profile.store';
import { useProfilePhoto } from '../../stores/profile-photo.store';

export function useChatPerson(thread: ChatThread | undefined, side: ChatSide) {
  const owner = useOwner(thread?.ownerId);
  const tenantName = usePersonName(thread?.tenantPhone ?? '', thread?.tenantName ?? 'Tenant');
  const tenantPhoto = useProfilePhoto(thread?.tenantPhone ?? '');
  if (side === 'tenant') {
    return { name: owner?.name ?? 'Owner', photo: owner?.photo, place: owner ? `${owner.area}, ${owner.city}` : '' };
  }
  return { name: tenantName, photo: tenantPhoto || undefined, place: '' };
}
