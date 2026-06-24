export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  agency: string;
  maxPeople: number;
  category: string;
  highlights: string[];
  itinerary: string[];
  includes: string[];
  excludes: string[];
  images: string[];
}

export const dummyPackages: Package[] = [
  {
    id: '1',
    name: 'Bali Paradise Adventure',
    description: 'Experience the magic of Bali with this comprehensive 7-day adventure package. From pristine beaches to ancient temples, discover the best of this Indonesian paradise.',
    price: 899,
    duration: '7 days / 6 nights',
    location: 'Bali, Indonesia',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500&h=300&fit=crop',
    agency: 'Tropical Adventures',
    maxPeople: 12,
    category: 'Adventure',
    highlights: [
      'Visit Ubud Monkey Forest',
      'Sunset at Tanah Lot Temple',
      'Snorkeling in Nusa Penida',
      'Traditional Balinese cooking class'
    ],
    itinerary: [
      'Day 1: Arrival and Ubud exploration',
      'Day 2: Monkey Forest and rice terraces',
      'Day 3: Temple hopping tour',
      'Day 4: Beach day and water sports',
      'Day 5: Nusa Penida island trip',
      'Day 6: Cultural experiences and shopping',
      'Day 7: Departure'
    ],
    includes: [
      '6 nights accommodation',
      'All meals',
      'Transportation',
      'Entrance fees',
      'English speaking guide'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Optional activities'
    ],
    images: [
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
    ]
  },
  {
    id: '2',
    name: 'Swiss Alps Explorer',
    description: 'Discover the breathtaking beauty of the Swiss Alps with this 5-day mountain adventure. Perfect for nature lovers and adventure seekers.',
    price: 1299,
    duration: '5 days / 4 nights',
    location: 'Swiss Alps, Switzerland',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    agency: 'Alpine Adventures',
    maxPeople: 8,
    category: 'Adventure',
    highlights: [
      'Cable car to Matterhorn',
      'Hiking in Zermatt',
      'Swiss chocolate factory tour',
      'Lake Geneva cruise'
    ],
    itinerary: [
      'Day 1: Arrival in Zurich',
      'Day 2: Train to Zermatt',
      'Day 3: Matterhorn exploration',
      'Day 4: Lake Geneva region',
      'Day 5: Departure'
    ],
    includes: [
      '4 nights accommodation',
      'Breakfast and dinner',
      'Train passes',
      'Cable car tickets',
      'Mountain guide'
    ],
    excludes: [
      'International flights',
      'Lunch',
      'Travel insurance',
      'Personal expenses'
    ],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec0b0b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ]
  },
  {
    id: '3',
    name: 'Tokyo Cultural Journey',
    description: 'Immerse yourself in Japanese culture with this 6-day Tokyo experience. From ancient temples to modern technology, discover the perfect blend of tradition and innovation.',
    price: 1099,
    duration: '6 days / 5 nights',
    location: 'Tokyo, Japan',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
    agency: 'Japan Explorer',
    maxPeople: 10,
    category: 'Cultural',
    highlights: [
      'Senso-ji Temple visit',
      'Tsukiji Fish Market tour',
      'Traditional tea ceremony',
      'Shibuya crossing experience'
    ],
    itinerary: [
      'Day 1: Arrival and Asakusa',
      'Day 2: Imperial Palace and Ginza',
      'Day 3: Tsukiji and Sumida River',
      'Day 4: Shibuya and Harajuku',
      'Day 5: Day trip to Nikko',
      'Day 6: Departure'
    ],
    includes: [
      '5 nights accommodation',
      'All meals',
      'JR Pass',
      'Entrance fees',
      'Cultural experiences'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal shopping',
      'Optional activities'
    ],
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542640244-a10b6e5d1e2b?w=800&h=600&fit=crop'
    ]
  },
  {
    id: '4',
    name: 'Santorini Sunset Romance',
    description: 'Experience the romance of Santorini with this luxurious 4-day getaway. Perfect for couples seeking a magical escape in the Greek islands.',
    price: 1599,
    duration: '4 days / 3 nights',
    location: 'Santorini, Greece',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=300&fit=crop',
    agency: 'Greek Dreams',
    maxPeople: 6,
    category: 'Romantic',
    highlights: [
      'Sunset dinner in Oia',
      'Wine tasting tour',
      'Private boat cruise',
      'Luxury cave hotel stay'
    ],
    itinerary: [
      'Day 1: Arrival and Fira exploration',
      'Day 2: Oia and sunset dinner',
      'Day 3: Wine tour and boat cruise',
      'Day 4: Departure'
    ],
    includes: [
      '3 nights luxury accommodation',
      'All meals',
      'Wine tasting',
      'Boat cruise',
      'Airport transfers'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Optional spa treatments'
    ],
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop'
    ]
  },
  {
    id: '5',
    name: 'African Safari Adventure',
    description: 'Embark on an unforgettable 8-day safari adventure in Kenya. Witness the Big Five and experience the raw beauty of the African wilderness.',
    price: 2199,
    duration: '8 days / 7 nights',
    location: 'Masai Mara, Kenya',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&h=300&fit=crop',
    agency: 'Safari Experts',
    maxPeople: 12,
    category: 'Adventure',
    highlights: [
      'Big Five game drives',
      'Masai village visit',
      'Hot air balloon safari',
      'Traditional bush dinner'
    ],
    itinerary: [
      'Day 1: Arrival in Nairobi',
      'Day 2: Drive to Masai Mara',
      'Day 3-5: Game drives and safari',
      'Day 6: Hot air balloon experience',
      'Day 7: Cultural experiences',
      'Day 8: Departure'
    ],
    includes: [
      '7 nights accommodation',
      'All meals',
      'Game drives',
      'Park fees',
      'Professional guide'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Visa fees',
      'Personal expenses'
    ],
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544966503-7cc4ac81b4a1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
    ]
  },
  {
    id: '6',
    name: 'Iceland Northern Lights',
    description: 'Chase the aurora borealis in Iceland with this 5-day winter adventure. Experience glaciers, geysers, and the magical northern lights.',
    price: 1399,
    duration: '5 days / 4 nights',
    location: 'Reykjavik, Iceland',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&h=300&fit=crop',
    agency: 'Arctic Adventures',
    maxPeople: 8,
    category: 'Adventure',
    highlights: [
      'Northern lights hunting',
      'Blue Lagoon visit',
      'Golden Circle tour',
      'Glacier hiking'
    ],
    itinerary: [
      'Day 1: Arrival and Reykjavik',
      'Day 2: Golden Circle tour',
      'Day 3: Blue Lagoon and relaxation',
      'Day 4: Glacier adventure',
      'Day 5: Departure'
    ],
    includes: [
      '4 nights accommodation',
      'Breakfast',
      'Transportation',
      'Entrance fees',
      'Northern lights tour'
    ],
    excludes: [
      'International flights',
      'Lunch and dinner',
      'Travel insurance',
      'Personal expenses'
    ],
    images: [
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ]
  }
];

export const categories = [
  'All',
  'Adventure',
  'Cultural',
  'Romantic',
  'Beach',
  'Mountain',
  'City'
];

export const locations = [
  'All Locations',
  'Bali, Indonesia',
  'Swiss Alps, Switzerland',
  'Tokyo, Japan',
  'Santorini, Greece',
  'Masai Mara, Kenya',
  'Reykjavik, Iceland'
];
