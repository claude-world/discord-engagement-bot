import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Commander from './pages/Commander';
import Schedule from './pages/Schedule';
import History from './pages/History';
import Settings from './pages/Settings';

type Page = 'dashboard' | 'commander' | 'schedule' | 'history' | 'settings';

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '📊', label: '總覽' },
  { id: 'commander', icon: '🎯', label: '指揮' },
  { id: 'schedule', icon: '📅', label: '排程' },
  { id: 'history', icon: '📜', label: '歷史' },
  { id: 'settings', icon: '⚙', label: '設定' },
];

// Detect if running in menubar (small window) vs command center
const isMenubar = window.innerWidth < 500;

export default function App() {
  // Parse hash for initial page (e.g., #/commander)
  const hashPage = window.location.hash.replace('#/', '') as Page;
  const [page, setPage] = useState<Page>(
    NAV_ITEMS.some(n => n.id === hashPage) ? hashPage : 'dashboard'
  );

  // Menubar mode: compact dashboard
  if (isMenubar && page === 'dashboard') {
    return <Dashboard compact onNavigate={setPage} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <nav className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
              page === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
            title={item.label}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'commander' && <Commander />}
        {page === 'schedule' && <Schedule />}
        {page === 'history' && <History />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
