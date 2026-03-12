import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, categoryForMode } from '../context/DataContext';
import DuelRecord from './DuelRecord';
import Pagination from './Pagination';

const PER_PAGE = 10;

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export default function PolityPage() {
  const { id } = useParams<{ id: string }>();
  const polityId = Number(id);
  const { polities, polityMap, duels, mode, loading, error } = useData();
  const [page, setPage] = useState(1);
  const [expandedDuelId, setExpandedDuelId] = useState<number | null>(null);

  useEffect(() => { setPage(1); setExpandedDuelId(null); }, [mode]);

  const polity = polityMap.get(polityId);

  const category = categoryForMode(mode);
  const filteredDuels = useMemo(() => {
    return duels.filter(d =>
      d.category === category &&
      (d.winner_id === polityId || d.loser_id === polityId)
    );
  }, [duels, category, polityId]);

  const rank = useMemo(() => {
    const sorted = [...polities].sort((a, b) => {
      const ratingA = mode === 'qol' ? a.qol_rating : a.darwinian_rating;
      const ratingB = mode === 'qol' ? b.qol_rating : b.darwinian_rating;
      return ratingB - ratingA;
    });
    return sorted.findIndex(p => p.id === polityId) + 1;
  }, [polities, polityId, mode]);

  const wins = filteredDuels.filter(d => d.winner_id === polityId).length;
  const losses = filteredDuels.filter(d => d.loser_id === polityId).length;

  const totalPages = Math.ceil(filteredDuels.length / PER_PAGE);
  const pageDuels = filteredDuels.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div className="loading">Loading&hellip;</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!polity) return <div className="error">Polity not found. <Link to="/">Back to rankings</Link></div>;

  const rating = mode === 'qol' ? polity.qol_rating : polity.darwinian_rating;

  return (
    <div className="polity-page">
      <Link to="/" className="back-link">&larr; Back to Rankings</Link>

      <div className="polity-hero">
        <h2>{polity.name}</h2>
        <span className="polity-year">{formatYear(polity.start_year)}</span>
        <p className="polity-description">{polity.description}</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">{mode === 'qol' ? 'QoL' : 'Darwinian'} Rating</div>
          <div className="stat-value stat-elo">{Math.round(rating)}</div>
          <div className="stat-rank">Rank #{rank} of {polities.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Record</div>
          <div className="stat-value">{wins}W - {losses}L</div>
          <div className="stat-rank">{filteredDuels.length} duels</div>
        </div>
      </div>

      <h3 className="section-title">
        {mode === 'qol' ? 'Quality of Life' : 'Darwinian Fitness'} Duels
      </h3>

      {filteredDuels.length === 0 ? (
        <p className="no-duels">No duels recorded yet.</p>
      ) : (
        <>
          <div className="duel-list">
            {pageDuels.map(duel => (
              <DuelRecord
                key={duel.id}
                duel={duel}
                polityId={polityId}
                expanded={expandedDuelId === duel.id}
                onToggle={() => setExpandedDuelId(expandedDuelId === duel.id ? null : duel.id)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
