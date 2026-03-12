import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Duel } from '../types';

interface Props {
  duel: Duel;
  polityId: number;
  expanded: boolean;
  onToggle: () => void;
}

function stripMarkdown(text: string): string {
  return text.replace(/#{1,6}\s?/g, '').replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
}

export default function DuelRecord({ duel, polityId, expanded, onToggle }: Props) {
  const { polityMap, topicMap, getEvaluation, fetchEvaluations, evalLoading } = useData();

  const won = duel.winner_id === polityId;
  const opponentId = won ? duel.loser_id : duel.winner_id;
  const opponent = polityMap.get(opponentId);
  const topic = topicMap.get(duel.topic_id);

  const evaluation = getEvaluation(duel);
  const loading = evalLoading(duel.polity_a_id);

  // Fetch evaluations when expanded
  useEffect(() => {
    if (expanded && !evaluation) {
      fetchEvaluations(duel.polity_a_id);
    }
  }, [expanded, evaluation, duel.polity_a_id, fetchEvaluations]);

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
          {topic ? (
            <Link to={`/topic/${topic.id}`} onClick={e => e.stopPropagation()} className="duel-topic-link" ref={topicRef as React.Ref<HTMLAnchorElement>}>{topic.topic}</Link>
          ) : (
            <span className="duel-topic" ref={topicRef}>—</span>
          )}
          {isOverflowing && <span className="duel-topic-tooltip">{topic!.topic}</span>}
        </span>
        <span className={`badge ${won ? 'badge-win' : 'badge-loss'}`}>
          {won ? 'Won' : 'Lost'}
        </span>
        <span className="duel-chevron">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="duel-evaluation">
          {loading ? (
            <div className="spinner">Loading evaluation&hellip;</div>
          ) : evaluation ? (
            <p>{stripMarkdown(evaluation)}</p>
          ) : (
            <p className="no-eval">No evaluation available.</p>
          )}
        </div>
      )}
    </div>
  );
}
