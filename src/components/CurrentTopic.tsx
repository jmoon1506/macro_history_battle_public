import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData, categoryForMode } from '../context/DataContext';
import type { Topic } from '../types';
import leftWojak from '../assets/left_wojak.svg';
import rightWojak from '../assets/right_wojak.svg';

const DISPLAY_DELAY_MS = 8 * 60 * 60 * 1000; // 8 hours

function isTopicActive(topic: Topic): boolean {
  if (!topic.starts_at) return true;
  return new Date(topic.starts_at).getTime() + DISPLAY_DELAY_MS <= Date.now();
}

function getCountdownTo(target: Date): { hours: number; minutes: number; seconds: number } {
  const diffMs = target.getTime() - Date.now();
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
  const { topics, mode } = useData();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const category = categoryForMode(mode);
  const categoryTopics = useMemo(
    () => topics.filter(t => t.category === category),
    [topics, category]
  );

  // Current topic = most recent active topic
  const currentTopic = useMemo(() => {
    const active = categoryTopics.filter(isTopicActive);
    return active.length > 0 ? active[active.length - 1] : null;
  }, [categoryTopics, now]);

  // Next upcoming topic = earliest future topic
  const nextTopic = useMemo(() => {
    const future = categoryTopics.filter(t => t.starts_at && !isTopicActive(t));
    return future.length > 0 ? future[0] : null;
  }, [categoryTopics, now]);

  const countdown = nextTopic?.starts_at
    ? getCountdownTo(new Date(new Date(nextTopic.starts_at).getTime() + DISPLAY_DELAY_MS))
    : null;

  if (!currentTopic) return null;

  return (
    <div className="current-topic">
      <img className="current-topic-wojak current-topic-wojak-left" src={leftWojak} alt="" aria-hidden="true" />
      <img className="current-topic-wojak current-topic-wojak-right" src={rightWojak} alt="" aria-hidden="true" />
      <div className="current-topic-accent" />
      <div className="current-topic-label">Current Duel Topic</div>
      <Link to={`/topic/${currentTopic.id}`} className="current-topic-text">&ldquo;{currentTopic.topic}&rdquo;</Link>
      <div className="current-topic-divider">
        <span />
        <span className="current-topic-diamond" />
        <span />
      </div>
      {countdown && (
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
      )}
    </div>
  );
}
