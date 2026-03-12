import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Duel } from '../types';

interface Props {
  duel: Duel;
  polityId: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function DuelRecord({ duel, polityId, expanded, onToggle }: Props) {
  const { polityMap, topicMap, duelsFull, fullLoading } = useData();

  const won = duel.winner_id === polityId;
  const opponentId = won ? duel.loser_id : duel.winner_id;
  const opponent = polityMap.get(opponentId);
  const topic = topicMap.get(duel.topic_id);

  const fullDuel = duelsFull?.find(d => d.id === duel.id);

  const topicRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleMouseEnter = () => {
    const el = topicRef.current;
    if (el) setIsOverflowing(el.scrollWidth > el.clientWidth);
  };

  return (
    <div className={`duel-record ${expanded ? 'expanded' : ''}`}>
      <div className="duel-row" onClick={onToggle}>
        <span className="duel-opponent">
          vs{' '}
          <Link to={`/polity/${opponentId}`} onClick={e => e.stopPropagation()} className="polity-link">
            {opponent?.name ?? `#${opponentId}`}
          </Link>
        </span>
        <span className="duel-topic-wrapper" onMouseEnter={handleMouseEnter}>
          <span className="duel-topic" ref={topicRef}>{topic?.topic ?? '—'}</span>
          {isOverflowing && <span className="duel-topic-tooltip">{topic!.topic}</span>}
        </span>
        <span className={`badge ${won ? 'badge-win' : 'badge-loss'}`}>
          {won ? 'Won' : 'Lost'}
        </span>
        <span className="duel-chevron">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="duel-evaluation">
          {fullLoading ? (
            <div className="spinner">Loading evaluation&hellip;</div>
          ) : fullDuel?.evaluation ? (
            <p>{fullDuel.evaluation}</p>
          ) : (
            <p className="no-eval">No evaluation available.</p>
          )}
        </div>
      )}
    </div>
  );
}
