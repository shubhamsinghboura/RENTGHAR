import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ChatSide = 'tenant' | 'owner';

export type ChatMessage = {
  id: string;
  from: ChatSide;
  text: string;
  at: number;
};

export type ChatThread = {
  id: string;
  homeId: string;
  ownerId: string;
  tenantPhone: string;
  tenantName: string;
  messages: ChatMessage[];
  updatedAt: number;
};

type ChatStart = {
  homeId: string;
  ownerId: string;
  tenantPhone: string;
  tenantName: string;
};

type ChatState = {
  threads: ChatThread[];
  open: (start: ChatStart) => string;
  send: (threadId: string, from: ChatSide, text: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      open: start => {
        const found = get().threads.find(
          thread => thread.homeId === start.homeId && thread.tenantPhone === start.tenantPhone,
        );
        if (found) {
          return found.id;
        }
        const now = Date.now();
        const thread: ChatThread = { ...start, id: `chat-${now}`, messages: [], updatedAt: now };
        set(state => ({ threads: [thread, ...state.threads] }));
        return thread.id;
      },
      send: (threadId, from, text) =>
        set(state => {
          const now = Date.now();
          return {
            threads: state.threads.map(thread =>
              thread.id === threadId
                ? {
                    ...thread,
                    updatedAt: now,
                    messages: [...thread.messages, { id: `${now}`, from, text, at: now }],
                  }
                : thread,
            ),
          };
        }),
    }),
    {
      name: 'rentghar-chats-v3',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const noThreads: ChatThread[] = [];

export function useThreads(side: ChatSide, key: string) {
  const threads = useChatStore(state => state.threads);
  if (!key) {
    return noThreads;
  }
  return threads
    .filter(
      thread =>
        thread.messages.length > 0 && (side === 'tenant' ? thread.tenantPhone === key : thread.ownerId === key),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
