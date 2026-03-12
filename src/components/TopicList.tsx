import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData, categoryForMode } from '../context/DataContext';
import Pagination from './Pagination';

const PER_PAGE = 20;

export default function TopicList() {
  const { topics, duels, mode, loading, error } = useData();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [mode]);

  const category = categoryForMode(mode);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => t.category === category);
  }, [topics, category]);

  const duelCountByTopic = useMemo(() => {
    const counts = new Map<number, number>();
    for (const d of duels) {
      if (d.category === category && d.winner_id != null && d.loser_id != null) {
        counts.set(d.topic_id, (counts.get(d.topic_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [duels, category]);

  const totalPages = Math.ceil(filteredTopics.length / PER_PAGE);
  const pageItems = filteredTopics.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div className="loading">Loading topics&hellip;</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="topic-list-page">
      <Link to="/" className="back-link">&larr; Rankings</Link>
      <h2 className="section-title">
        {mode === 'qol' ? 'Quality of Life' : 'Darwinian Fitness'} Topics
      </h2>

      {filteredTopics.length === 0 ? (
        <p className="no-duels">No topics yet.</p>
      ) : (
        <>
          <div className="topic-list">
            {pageItems.map(t => {
              const count = duelCountByTopic.get(t.id) ?? 0;
              return (
                <Link to={`/topic/${t.id}`} key={t.id} className="topic-row">
                  <span className="topic-row-text">{t.topic}</span>
                  <span className="topic-row-count">{count} duel{count !== 1 ? 's' : ''}</span>
                  <span className="duel-chevron">&#9654;</span>
                </Link>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
