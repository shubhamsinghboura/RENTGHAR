export type HomeListing = {
  id: string;
  ownerId: string;
  city: string;
  type: string;
  title: string;
  area: string;
  rent: string;
  deposit: string;
  images: string[];
  description: string;
  furnishing: string;
  available: string;
  ownerName?: string;
  ownerPhoto?: string;
};

export const homes: HomeListing[] = [
  {
    id: 'koregaon',
    ownerId: 'meera-shah',
    city: 'Pune',
    type: '2 BHK',
    title: '2 BHK with a terrace',
    area: 'Koregaon Park',
    rent: '₹22,000',
    deposit: '₹40,000',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=70',
    ],
    description:
      'A furnished 2 BHK with a private terrace, a few minutes from the park and cafes.',
    furnishing: 'Furnished',
    available: 'Available now',
  },
  {
    id: 'baner',
    ownerId: 'arjun',
    city: 'Pune',
    type: 'Room',
    title: 'Sunny private room',
    area: 'Baner',
    rent: '₹9,500',
    deposit: '₹10,000',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=70',
    ],
    description: 'A private room with morning light, a shared kitchen, and a quiet lane.',
    furnishing: 'Semi-furnished',
    available: 'Available now',
  },
  {
    id: 'kothrud',
    ownerId: 'nita',
    city: 'Pune',
    type: 'PG',
    title: 'PG near the college road',
    area: 'Kothrud',
    rent: '₹7,800',
    deposit: '₹5,000',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=70',
    ],
    description: 'A PG bed near college road, with meals and a shared study area.',
    furnishing: 'Furnished',
    available: 'From next week',
  },
  {
    id: 'indira',
    ownerId: 'meera-joshi',
    city: 'Bengaluru',
    type: '1 BHK',
    title: 'Quiet 1 BHK',
    area: 'Indiranagar',
    rent: '₹28,000',
    deposit: '₹50,000',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70',
    ],
    description: 'A quiet 1 BHK on a residential street, a short walk from the metro.',
    furnishing: 'Semi-furnished',
    available: 'Available now',
  },
  {
    id: 'bandra',
    ownerId: 'kabir',
    city: 'Mumbai',
    type: 'Room',
    title: 'Room with a balcony',
    area: 'Bandra West',
    rent: '₹18,000',
    deposit: '₹20,000',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=70',
    ],
    description: 'A private room with a balcony, near the station and local shops.',
    furnishing: 'Furnished',
    available: 'Available now',
  },
  {
    id: 'hauz',
    ownerId: 'isha',
    city: 'Delhi',
    type: 'Independent House',
    title: 'Independent house portion',
    area: 'Hauz Khas',
    rent: '₹35,000',
    deposit: '₹70,000',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1200&q=70',
    ],
    description: 'A portion of an independent house, with its own entrance and parking.',
    furnishing: 'Unfurnished',
    available: 'Available now',
  },
];

export function findHome(id: string) {
  return homes.find(home => home.id === id);
}
