import create from 'zustand';

type State = {
  connected: boolean;
  setConnected: (v: boolean) => void;
  soulId?: string | null;
  setSoulId: (id: string | null) => void;
};

export const useStore = create<State>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),
  soulId: null,
  setSoulId: (id) => set({ soulId: id })
}));