import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Social: {
    initialTab?: 'leaderboard' | 'notifications';
  } | undefined;
  Order: undefined;
  Profile: undefined;
};

export type RecordScoreMode = 'LIVE' | 'POST';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token?: string;
  };
  Tabs: NavigatorScreenParams<TabParamList>;
  NewRound: { recordMode?: RecordScoreMode } | undefined;
  PlayerSelection: { recordMode?: RecordScoreMode } | undefined;
  RoundScoring: {
    roundId: string;
    recordMode?: RecordScoreMode;
  };
  Scorecard: {
    roundId: string;
  };
  RoundSummary: {
    roundId: string;
  };
  OrderStatus: {
    orderId: string;
  };
  HoleMap: {
    roundId: string;
    holeNumber: number;
  };
};
