import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ChatMessage = {
  id: string;
  mine: boolean;
  text: string;
};

export type ChatThread = {
  id: string;
  side: 'tenant' | 'owner';
  homeId: string;
  ownerId?: string;
  person: string;
  messages: ChatMessage[];
};

const threads: ChatThread[] = [
  {
    id: 'meera',
    side: 'tenant',
    homeId: 'koregaon',
    ownerId: 'meera-shah',
    person: 'Meera Shah',
    messages: [
      { id: 'meera-1', mine: false, text: 'Sunday after 4 is free. The terrace stays with the flat.' },
    ],
  },
  {
    id: 'arjun',
    side: 'tenant',
    homeId: 'baner',
    ownerId: 'arjun',
    person: 'Arjun Kale',
    messages: [
      { id: 'arjun-1', mine: true, text: 'Is the room still available this month?' },
      { id: 'arjun-2', mine: false, text: 'Yes. The kitchen is shared, and food is not included.' },
    ],
  },
  {
    id: 'nita',
    side: 'tenant',
    homeId: 'kothrud',
    ownerId: 'nita',
    person: 'Nita Deshpande',
    messages: [{ id: 'nita-1', mine: false, text: 'Two beds are free from next week. Meals come with the PG.' }],
  },
  {
    id: 'meera-joshi',
    side: 'tenant',
    homeId: 'indira',
    ownerId: 'meera-joshi',
    person: 'Meera Joshi',
    messages: [{ id: 'joshi-1', mine: false, text: 'The 1 BHK is free. I can show it after 6.' }],
  },
  {
    id: 'aisha',
    side: 'owner',
    homeId: 'koregaon',
    person: 'Aisha',
    messages: [{ id: 'aisha-1', mine: false, text: 'Is the terrace private? I can come by on Saturday.' }],
  },
  {
    id: 'rohan',
    side: 'owner',
    homeId: 'baner',
    person: 'Rohan',
    messages: [
      { id: 'rohan-1', mine: false, text: 'Can I move in this month if the deposit is ready?' },
      { id: 'rohan-2', mine: true, text: 'Yes, if you confirm by Friday.' },
    ],
  },
  {
    id: 'leela',
    side: 'owner',
    homeId: 'kothrud',
    person: 'Leela',
    messages: [{ id: 'leela-1', mine: false, text: 'Does the PG take students, and is the food vegetarian?' }],
  },
];

type ChatState = {
  threads: ChatThread[];
  send: (threadId: string, text: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      threads,
      send: (threadId, text) =>
        set(state => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [...thread.messages, { id: `${Date.now()}`, mine: true, text }],
                }
              : thread,
          ),
        })),
    }),
    {
      name: 'rentghar-chats-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
