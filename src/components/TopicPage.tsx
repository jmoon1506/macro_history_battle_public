import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, categoryForMode } from '../context/DataContext';
import TopicDuelRecord from './TopicDuelRecord';
import Pagination from './Pagination';

const PER_PAGE = 10;

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const topicId = Number(id);
  const { topicMap, polityMap, duels, mode, loading, error } = useData();
  const [page, setPage] = useState(1);
  const [expandedDuelId, setExpandedDuelId] = useState<number | null>(null);

  useEffect(() => { setPage(1); setExpandedDuelId(null); }, [mode]);

  const topic = topicMap.get(topicId);

  const category = categoryForMode(mode);
  const filteredDuels = useMemo(() => {
    return duels
      .filter(d =>
        d.topic_id === topicId &&
        d.category === category &&
        d.winner_id != null && d.loser_id != null
      )
      .sort((a, b) => {
        const nameA = polityMap.get(a.winner_id)?.name ?? '';
        const nameB = polityMap.get(b.winner_id)?.name ?? '';
        return nameA.localeCompare(nameB);
      });
  }, [duels, category, topicId, polityMap]);

  const totalPages = Math.ceil(filteredDuels.length / PER_PAGE);
  const pageDuels = filteredDuels.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div className="loading">Loading&hellip;</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!topic) return <div className="error">Topic not found. <Link to="/topics">Back to topics</Link></div>;

  // If topic doesn't match current mode, show a message
  if (topic.category !== category) {
    return (
      <div className="topic-page">
        <Link to="/topics" className="back-link">&larr; All Topics</Link>
        <p className="no-duels">
          This topic belongs to the {topic.category === 'quality-of-life' ? 'Quality of Life' : 'Darwinian Fitness'} category.
          Switch modes to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="topic-page">
      <Link to="/topics" className="back-link">&larr; All Topics</Link>

      <div className="topic-hero">
        <div className="topic-hero-label">
          {mode === 'qol' ? 'Quality of Life' : 'Darwinian Fitness'} Topic
        </div>
        <h2>{topic.topic}</h2>
        {topic.summary && <p className="topic-summary">{topic.summary}</p>}
      </div>

      <h3 className="section-title">
        Duels
      </h3>

      {filteredDuels.length === 0 ? (
        <p className="no-duels">No duels recorded for this topic yet.</p>
      ) : (
        <>
          <div className="duel-list">
            {pageDuels.map(duel => (
              <TopicDuelRecord
                key={duel.id}
                duel={duel}
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
