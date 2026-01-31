import { useState } from 'react';
import { useZustandStore } from '../stores/zustandStore';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { type RootState, increment as incrementRedux, decrement as decrementRedux, store } from '../stores/reduxStore';
import { useMachine } from '@xstate/react';
import { counterMachine } from '../stores/xstateMachine';
import './Counter.css';

// --- Redux Implementation ---
const ReduxCounterInner = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="counter-display redux-theme">
      <div className="count-value">{count}</div>
      <div className="counter-controls">
        <button onClick={() => dispatch(decrementRedux())} className="btn-redux">-</button>
        <button onClick={() => dispatch(incrementRedux())} className="btn-redux">+</button>
      </div>
      <p className="library-tag">Powered by Redux</p>
    </div>
  );
};

const ReduxCounterWrapper = () => (
  <Provider store={store}>
    <ReduxCounterInner />
  </Provider>
);

// --- Zustand Implementation ---
const ZustandCounter = () => {
  const { count, increment, decrement } = useZustandStore();

  return (
    <div className="counter-display zustand-theme">
      <div className="count-value">{count}</div>
      <div className="counter-controls">
        <button onClick={decrement} className="btn-zustand">-</button>
        <button onClick={increment} className="btn-zustand">+</button>
      </div>
      <p className="library-tag">Powered by Zustand</p>
    </div>
  );
};

// --- XState Implementation ---
const XStateCounter = () => {
  // ISSUE: XState uses `useMachine`. It returns the current state snapshot and a 'send' function.
  // Instead of calling methods, we 'send' events to the machine, which decides what to do based on its current state.
  const [state, send] = useMachine(counterMachine);

  return (
    <div className="counter-display xstate-theme">
      <div className="count-value">{state.context.count}</div>
      <div className="counter-controls">
        <button onClick={() => send({ type: 'DECREMENT' })} className="btn-xstate">-</button>
        <button onClick={() => send({ type: 'INCREMENT' })} className="btn-xstate">+</button>
      </div>
      <p className="library-tag">Powered by XState</p>
    </div>
  );
};

// --- Main Container ---
export const Counter = () => {
  const [library, setLibrary] = useState<'zustand' | 'redux' | 'xstate'>('zustand');

  return (
    <div className="counter-container">
      <div className="selector-wrapper">
        <label htmlFor="lib-select">Choose State Manager:</label>
        <select 
          id="lib-select"
          value={library} 
          onChange={(e) => setLibrary(e.target.value as 'zustand' | 'redux' | 'xstate')}
          className="lib-selector"
        >
          <option value="zustand">Zustand</option>
          <option value="redux">Redux</option>
          <option value="xstate">XState</option>
        </select>
      </div>

      <div className="implementation-view">
        {library === 'zustand' && <ZustandCounter />}
        {library === 'redux' && <ReduxCounterWrapper />}
        {library === 'xstate' && <XStateCounter />}
      </div>
      
      <div className="comments-section">
        <h3>Implementation Notes:</h3>
        {library === 'zustand' && (
          <ul>
            <li>State is accessed via a simple hook: <code>useZustandStore()</code>.</li>
            <li>No top-level Provider component component was required.</li>
            <li>Actions are just functions pulled from the hook.</li>
          </ul>
        )}
        {library === 'redux' && (
          <ul>
            <li>State is accessed via <code>useSelector</code>.</li>
            <li>Actions are dispatched via <code>useDispatch</code>.</li>
            <li><b>Required:</b> Wrapped in <code>&lt;Provider store={'{store}'}&gt;</code>.</li>
             <li>More boilerplate code (slice, actions, reducers).</li>
          </ul>
        )}
        {library === 'xstate' && (
          <ul>
            <li>State is managed by a <b>State Machine</b>.</li>
            <li>We <code>send</code> events (e.g., 'INCREMENT') to the machine.</li>
            <li>The machine determines the next state and side effects.</li>
            <li>Great for complex logic, flows, and visualizing state transitions.</li>
          </ul>
        )}
      </div>
    </div>
  );
};
