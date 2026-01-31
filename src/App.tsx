import './App.css'
import { UserActivity } from './components/UserActivity'
import { Counter } from './components/Counter'

function App() {
  return (
    <div className="app-container">
      {/* Section 1: State Management Demo */}
      <section className="scroll-section">
        <h1 className="section-title">State Management Face-off</h1>
        <Counter />
        <div className="scroll-hint">Scroll down for user activity tracker ↓</div>
      </section>

      {/* Section 2: User Activity Demo */}
      <section className="scroll-section">
        <h1 className="section-title">Smart Activity Monitor</h1>
        <div className="activity-demo-wrapper">
          <p className="demo-description">
            This component uses an <b>XState Machine</b> to track user inactivity.<br/>
            It will mark the user as <b>AFK</b> after 5 seconds of no interaction.
          </p>
          <UserActivity username="Jordan" timeout={5000} />
        </div>
      </section>
    </div>
  )
}

export default App
