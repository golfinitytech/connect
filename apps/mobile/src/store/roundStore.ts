import { create } from 'zustand';

type RoundStore = {
  selectedCourseId: string | null;
  selectedTeeBoxId: string | null;
  gameMode: 'STROKE_PLAY' | 'STABLEFORD' | 'MATCH_PLAY';
  selectedPlayerIds: string[];
  eventName: string;
  caddyName: string;
  caddyNumber: string;
  teeDate: string;
  teeTime: string;
  setCourse: (courseId: string, teeBoxId: string) => void;
  setGameMode: (gameMode: RoundStore['gameMode']) => void;
  setEventName: (value: string) => void;
  setCaddyName: (value: string) => void;
  setCaddyNumber: (value: string) => void;
  setTeeDate: (value: string) => void;
  setTeeTime: (value: string) => void;
  togglePlayer: (playerId: string) => void;
  reset: () => void;
};

const initialState = {
  selectedCourseId: null,
  selectedTeeBoxId: null,
  gameMode: 'STROKE_PLAY' as const,
  selectedPlayerIds: ['user_alex'],
  eventName: '',
  caddyName: '',
  caddyNumber: '',
  teeDate: '',
  teeTime: '',
};

export const useRoundStore = create<RoundStore>((set) => ({
  ...initialState,
  setCourse: (selectedCourseId, selectedTeeBoxId) =>
    set({
      selectedCourseId,
      selectedTeeBoxId,
    }),
  setGameMode: (gameMode) => set({ gameMode }),
  setEventName: (eventName) => set({ eventName }),
  setCaddyName: (caddyName) => set({ caddyName }),
  setCaddyNumber: (caddyNumber) => set({ caddyNumber }),
  setTeeDate: (teeDate) => set({ teeDate }),
  setTeeTime: (teeTime) => set({ teeTime }),
  togglePlayer: (playerId) =>
    set((state) => {
      const exists = state.selectedPlayerIds.includes(playerId);
      if (exists && playerId === 'user_alex') {
        return state;
      }
      const current = exists
        ? state.selectedPlayerIds.filter((id) => id !== playerId)
        : [...state.selectedPlayerIds, playerId];

      return {
        selectedPlayerIds: current.slice(0, 4),
      };
    }),
  reset: () => set({ ...initialState, selectedPlayerIds: ['user_alex'] }),
}));
