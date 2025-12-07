import { create } from 'zustand';
import { AppState } from './types';

interface State {
  mode: AppState;
  toggleMode: () => void;
}

export const useStore = create<State>((set) => ({
  mode: AppState.SCATTERED,
  toggleMode: () => set((state) => ({
    mode: state.mode === AppState.SCATTERED ? AppState.TREE_SHAPE : AppState.SCATTERED
  })),
}));