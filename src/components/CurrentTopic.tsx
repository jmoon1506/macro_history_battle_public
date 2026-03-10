import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import leftWojak from '../assets/left_wojak.svg';
import rightWojak from '../assets/right_wojak.svg';

function getTimeUntilMidnightPT(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const ptString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const ptNow = new Date(ptString);

  const ptMidnight = new Date(ptNow);
  ptMidnight.setDate(ptMidnight.getDate() + 1);
  ptMidnight.setHours(0, 0, 0, 0);

  const diffMs = ptMidnight.getTime() - ptNow.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function CurrentTopic() {
  const { topics } = useData();
  const [countdown, setCountdown] = useState(getTimeUntilMidnightPT);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightPT());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTopic = topics.length > 0 ? topics[topics.length - 1] : null;

  if (!currentTopic) return null;

  return (
    <div className="current-topic">
      <img className="current-topic-wojak current-topic-wojak-left" src={leftWojak} alt="" aria-hidden="true" />
      <img className="current-topic-wojak current-topic-wojak-right" src={rightWojak} alt="" aria-hidden="true" />
      <div className="current-topic-accent" />
      <div className="current-topic-label">Current Duel Topic</div>
      <div className="current-topic-text">&ldquo;{currentTopic.topic}&rdquo;</div>
      <div className="current-topic-divider">
        <span />
        <span className="current-topic-diamond" />
        <span />
      </div>
      <div className="countdown">
        <div className="countdown-label">Next topic in</div>
        <div className="countdown-timer">
          <div className="countdown-block">
            <span className="countdown-value">{pad(countdown.hours)}</span>
            <span className="countdown-unit">hrs</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-block">
            <span className="countdown-value">{pad(countdown.minutes)}</span>
            <span className="countdown-unit">min</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-block">
            <span className="countdown-value">{pad(countdown.seconds)}</span>
            <span className="countdown-unit">sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
