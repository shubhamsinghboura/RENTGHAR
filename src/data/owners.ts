export type OwnerProfile = {
  id: string;
  name: string;
  photo: string;
  city: string;
  area: string;
  since: string;
  about: string;
  homeIds: string[];
};

export const owners: OwnerProfile[] = [
  {
    id: 'meera-shah',
    name: 'Meera Shah',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=70',
    city: 'Pune',
    area: 'Koregaon Park',
    since: '2023',
    about: 'Lists one furnished flat and shows the terrace herself on visits.',
    homeIds: ['koregaon'],
  },
  {
    id: 'meera-joshi',
    name: 'Meera Joshi',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=70',
    city: 'Bengaluru',
    area: 'Indiranagar',
    since: '2025',
    about: 'Lists a quiet 1 BHK near the metro. Replies in the evening.',
    homeIds: ['indira'],
  },
  {
    id: 'arjun',
    name: 'Arjun Kale',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=70',
    city: 'Pune',
    area: 'Baner',
    since: '2022',
    about: 'Rents a private room in the house he lives in.',
    homeIds: ['baner'],
  },
  {
    id: 'nita',
    name: 'Nita Deshpande',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=70',
    city: 'Pune',
    area: 'Kothrud',
    since: '2021',
    about: 'Runs a small PG for students, with meals included.',
    homeIds: ['kothrud'],
  },
  {
    id: 'kabir',
    name: 'Kabir Mehta',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70',
    city: 'Mumbai',
    area: 'Bandra West',
    since: '2024',
    about: 'Lists a room with a balcony, close to the station.',
    homeIds: ['bandra'],
  },
  {
    id: 'isha',
    name: 'Isha Malhotra',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=70',
    city: 'Delhi',
    area: 'Hauz Khas',
    since: '2020',
    about: 'Rents a portion of her independent house, with parking.',
    homeIds: ['hauz'],
  },
];

export function findOwner(id: string) {
  return owners.find(owner => owner.id === id);
}
