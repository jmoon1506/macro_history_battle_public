import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Leaderboard from './components/Leaderboard';
import PolityPage from './components/PolityPage';
import TopicList from './components/TopicList';
import TopicPage from './components/TopicPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/polity/:id" element={<PolityPage />} />
        <Route path="/topics" element={<TopicList />} />
        <Route path="/topic/:id" element={<TopicPage />} />
      </Routes>
    </Layout>
  );
}
