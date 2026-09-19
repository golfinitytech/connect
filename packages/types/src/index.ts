export type CourseSummary = {
  id: string;
  name: string;
  city: string;
  country: string;
  totalHoles: number;
};

export type RoundSummary = {
  id: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'FINISHED';
  currentHole: number;
};

export type LeaderboardEntry = {
  position: number;
  userId: string;
  playerName: string;
  total: number;
  thru: number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
};
