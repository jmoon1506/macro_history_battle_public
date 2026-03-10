import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Leaderboard from './components/Leaderboard';
import PolityPage from './components/PolityPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/polity/:id" element={<PolityPage />} />
      </Routes>
    </Layout>
  );
}
