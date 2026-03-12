import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData, categoryForMode } from '../context/DataContext';
import Pagination from './Pagination';
import CurrentTopic from './CurrentTopic';

const PER_PAGE = 20;

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export default function Leaderboard() {
  const { polities, duels, mode, loading, error } = useData();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [mode]);

  const category = categoryForMode(mode);
  const filteredDuels = useMemo(() => {
    return duels.filter(d => d.category === category && d.winner_id != null && d.loser_id != null);
  }, [duels, category]);

  const winLoss = useMemo(() => {
    const wl = new Map<number, { wins: number; losses: number }>();
    for (const p of polities) wl.set(p.id, { wins: 0, losses: 0 });
    for (const d of filteredDuels) {
      wl.get(d.winner_id)!.wins++;
      wl.get(d.loser_id)!.losses++;
    }
    return wl;
  }, [polities, filteredDuels]);

  const sorted = useMemo(() => {
    return [...polities].sort((a, b) => {
      const ratingA = mode === 'qol' ? a.qol_rating : a.darwinian_rating;
      const ratingB = mode === 'qol' ? b.qol_rating : b.darwinian_rating;
      return ratingB - ratingA;
    });
  }, [polities, mode]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div className="loading">Loading rankings&hellip;</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const rankOffset = (page - 1) * PER_PAGE;

  return (
    <div className="leaderboard">
      <CurrentTopic />

      {/* Desktop table */}
      <div className="table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Year</th>
              <th>Rating</th>
              <th>W-L</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p, i) => {
              const rank = rankOffset + i + 1;
              const wl = winLoss.get(p.id)!;
              const rating = mode === 'qol' ? p.qol_rating : p.darwinian_rating;
              const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
              return (
                <tr key={p.id} className={rankClass}>
                  <td className="rank-cell">{rank}</td>
                  <td>
                    <Link to={`/polity/${p.id}`} className="polity-link">{p.name}</Link>
                  </td>
                  <td>{formatYear(p.start_year)}</td>
                  <td className="elo-cell">{Math.round(rating)}</td>
                  <td>{wl.wins}-{wl.losses}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="leaderboard-cards">
        {pageItems.map((p, i) => {
          const rank = rankOffset + i + 1;
          const wl = winLoss.get(p.id)!;
          const rating = mode === 'qol' ? p.qol_rating : p.darwinian_rating;
          const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
          return (
            <Link to={`/polity/${p.id}`} key={p.id} className={`leaderboard-card ${rankClass}`}>
              <div className="card-rank">#{rank}</div>
              <div className="card-info">
                <div className="card-name">{p.name}</div>
                <div className="card-year">{formatYear(p.start_year)}</div>
              </div>
              <div className="card-stats">
                <span className="card-elo">{Math.round(rating)}</span>
                <span className="card-wl">{wl.wins}W-{wl.losses}L</span>
              </div>
            </Link>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
