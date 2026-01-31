import { useEffect, useState } from 'react';
import { useActor } from '@xstate/react';
import { userActivityMachine } from '../stores/userActivityMachine';
import { differenceInSeconds } from 'date-fns';
import './UserActivity.css';

interface UserActivityProps {
  username?: string;
  timeout?: number;
}

export const UserActivity = ({ username = 'Jordan', timeout = 5000 }: UserActivityProps) => {
  const [snapshot] = useActor(userActivityMachine, {
    input: {
      timeout,
    },
  });

  const isActive = snapshot.matches('Active');
  const now = useTimestamp();
  const inactiveSeconds = differenceInSeconds(now, snapshot.context.lastActive);

  return (
    <div className={`activity-card ${!isActive ? 'is-idle' : ''}`}>
      <div className="avatar-container">
        {username.charAt(0).toUpperCase()}
        <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`} />
      </div>
      <div className="user-info">
        <span className="user-name">{username}</span>
        <span className={`user-status-text ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'Active Now' : 'AFK'}
        </span>
        {!isActive && (
          <span className="inactive-timer">
            Away for {inactiveSeconds}s
          </span>
        )}
      </div>
  
    </div>
  );
};

function useTimestamp() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return now;
}
