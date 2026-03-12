import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Mode } from '../context/DataContext';
import { WojakLeft, WojakRight } from './Wojaks';

export default function Layout({ children }: { children: ReactNode }) {
  const { mode, setMode } = useData();
  const location = useLocation();
  const hideToggle = location.pathname.startsWith('/topic/');

  return (
    <div className="layout">
      <WojakLeft />
      <WojakRight />
      <header className="header">
        <Link to="/" className="header-title">
          <h1>Official Macro History Rankings</h1>
        </Link>
        <nav className="header-nav" />
        {!hideToggle && (
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
        )}
      </header>
      <main className="main">{children}</main>
      <footer className="footer" />
    </div>
  );
}
