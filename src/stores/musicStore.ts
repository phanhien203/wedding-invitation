import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MUSIC_STORAGE_KEY } from "@/constants";

interface MusicState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  setPlaying: (playing: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      isMuted: false,
      volume: 0.7,
      setPlaying: (isPlaying) => set({ isPlaying }),
      setMuted: (isMuted) => set({ isMuted }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      togglePlay: () => set({ isPlaying: !get().isPlaying }),
      toggleMute: () => set({ isMuted: !get().isMuted }),
    }),
    { name: MUSIC_STORAGE_KEY }
  )
);
