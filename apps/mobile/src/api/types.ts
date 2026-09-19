export type User = {
  id: string;
  email: string;
  fullName: string;
  memberId: string;
  avatarUrl?: string;
  handicapIndex: number;
};

export type UserPreference = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  marketingEmails: boolean;
  privacyMode: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
};

export type TeeBox = {
  id: string;
  name: string;
  yardage: number;
  rating: number;
  slope: number;
};

export type Hole = {
  id: string;
  number: number;
  par: number;
  lengthYds: number;
  latitude?: number;
  longitude?: number;
};

export type Course = {
  id: string;
  name: string;
  city: string;
  country: string;
  imageUrl?: string;
  totalHoles: number;
  teeBoxes: TeeBox[];
  holes?: Hole[];
};

export type RoundPlayer = {
  userId: string;
  user: User;
};

export type Round = {
  id: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'FINISHED';
  gameMode: 'STROKE_PLAY' | 'STABLEFORD' | 'MATCH_PLAY';
  currentHole: number;
  course: Course;
  teeBox: TeeBox;
  players: RoundPlayer[];
  holeScores?: HoleScore[];
  updatedAt: string;
};

export type HoleScore = {
  id: string;
  roundId: string;
  holeId: string;
  userId: string;
  strokes: number;
  putts: number;
  fairwayHit?: 'LEFT' | 'CENTER' | 'RIGHT';
  gir?: boolean;
  hole?: Hole;
  user?: User;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: {
    name: string;
  };
};

export type Event = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  startDate: string;
  courseId: string;
  course?: Course;
};

export type OrderStatus = 'PENDING' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';

export type Order = {
  id: string;
  userId: string;
  roundId?: string;
  holeNumber?: number;
  status: OrderStatus;
  subtotal: number;
  serviceFee: number;
  totalPaid: number;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    menuItem: {
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
    };
  }[];
  statusLogs: {
    id: string;
    status: OrderStatus;
    note?: string;
    createdAt: string;
  }[];
};

export type LeaderboardEntry = {
  position: number;
  userId: string;
  playerName: string;
  total: number;
  thru: number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
};

export type EventRegistration = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  category: 'TOURNAMENT' | 'ORDER' | 'SOCIAL' | 'SYSTEM';
  readAt?: string | null;
};
