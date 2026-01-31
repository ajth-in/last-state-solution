import { setup, assign } from 'xstate';

// ISSUE: XState is about "State Machines" and "Statecharts".
// Unlike Redux/Zustand which primarily manage "data" (store), XState manages "states" (finite states) and "transitions".
// This requires a paradigm shift: thinking in events and transitions rather than just mutations.

export const counterMachine = setup({
  types: {
    context: {} as { count: number },
    events: {} as { type: 'INCREMENT' } | { type: 'DECREMENT' }
  },
  actions: {
    incrementContext: assign({
      count: ({ context }) => context.count + 1
    }),
    decrementContext: assign({
      count: ({ context }) => context.count - 1
    })
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2BXAdgFzAJwDoBDZbASwDcwBiASQDkBhAJQFEBZV+gFQG0AGALqJQAB1Swy5VJhEgAHogAsSgvwCcAZgCM-AOx6AbHq1L1AJiUAaEAE9E2owT3ntmgKwuAHO81fzPgC+gTZoWLiEJORU1AAirCwcXHxCcuKS0rJICsrmNvYIXtoEmubm6to+7qZ62obBISCYqBBwcmE4+GkSUmQycooIALSG+YhD7gTq0zOzs5rBoRidkaSUYN0ZfVmgg16qFYbGR5qaKu6GmmMI5gYE2trqJob8D0qV7koNgUA */
  id: 'counter',
  initial: 'active',
  context: {
    count: 0
  },
  // Simple machine with one state 'active' that listens to events.
  // Real power comes when you have states like 'loading', 'error', 'success', etc.
  states: {
    active: {
      on: {
        INCREMENT: {
          actions: 'incrementContext'
        },
        DECREMENT: {
          actions: 'decrementContext'
        }
      }
    }
  }
});
