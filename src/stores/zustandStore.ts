import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// ISSUE: Zustand stores are global but don't require a generic Context Provider wrapping the app.
// This is often simpler, but can sometimes make standardizing app-wide state management patterns harder if not disciplined.
export const useZustandStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
