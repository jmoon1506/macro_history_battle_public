import { useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Duel } from '../types';

interface Props {
  duel: Duel;
  expanded: boolean;
  onToggle: () => void;
}

function stripMarkdown(text: string): string {
  return text.replace(/#{1,6}\s?/g, '').replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
}

export default function TopicDuelRecord({ duel, expanded, onToggle }: Props) {
  const { polityMap, getEvaluation, fetchEvaluations, evalLoading } = useData();

  const winner = polityMap.get(duel.winner_id);
  const loser = polityMap.get(duel.loser_id);

  const evaluation = getEvaluation(duel);
  const loading = evalLoading(duel.polity_a_id);

  useEffect(() => {
    if (expanded && !evaluation) {
      fetchEvaluations(duel.polity_a_id);
    }
  }, [expanded, evaluation, duel.polity_a_id, fetchEvaluations]);

  return (
    <div className={`duel-record ${expanded ? 'expanded' : ''}`}>
      <div className="duel-row" onClick={onToggle}>
        <span className="duel-matchup">
          <span className="matchup-polity">
            <span className="badge badge-win">Won</span>
            {winner?.name ?? `#${duel.winner_id}`}
          </span>
          <span className="matchup-vs">vs</span>
          <span className="matchup-polity">
            {loser?.name ?? `#${duel.loser_id}`}
            <span className="badge badge-loss">Lost</span>
          </span>
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
