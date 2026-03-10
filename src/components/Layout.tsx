import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Mode } from '../context/DataContext';
import { WojakLeft, WojakRight } from './Wojaks';

export default function Layout({ children }: { children: ReactNode }) {
  const { mode, setMode } = useData();

  return (
    <div className="layout">
      <WojakLeft />
      <WojakRight />
      <header className="header">
        <Link to="/" className="header-title">
          <h1>Official Macro History Rankings</h1>
        </Link>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="mode-toggle">
          {(['qol', 'darwinian'] as Mode[]).map(m => (
            <button
              key={m}
              className={mode === m ? 'active' : ''}
              onClick={() => setMode(m)}
            >
              {m === 'qol' ? 'Quality of Life' : 'Darwinian Fitness'}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
