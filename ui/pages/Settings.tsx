import React from 'react';
import { useStatus } from '../hooks/useIPC';

export default function Settings() {
  const { status } = useStatus();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* Bot Status */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Bot 狀態</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-400">連線狀態</div>
          <div className={status?.connected ? 'text-green-400' : 'text-red-400'}>
            {status?.connected ? '已連線' : '離線'}
          </div>
          <div className="text-gray-400">今日發送</div>
          <div>{status?.todayCount ?? 0} 則</div>
          <div className="text-gray-400">排程數量</div>
          <div>{status?.schedule?.length ?? 0} 個</div>
        </div>
      </div>

      {/* Config (read-only from .env) */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">頻道設定</h2>
        {['daily-tips', 'general', 'announcements', 'news', 'showcase', 'bot-logs'].map((ch) => (
          <div key={ch} className="flex items-center gap-3">
            <label className="text-sm text-gray-400 w-32">#{ch}</label>
            <span className="text-sm text-gray-500">從 .env 載入</span>
          </div>
        ))}
      </div>

      {/* Content Engine */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">內容引擎</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-400">CLI</div>
          <div><code className="text-gray-300">claude -p</code></div>
          <div className="text-gray-400">MCP</div>
          <div>trend-pulse + cf-browser</div>
          <div className="text-gray-400">知識庫</div>
          <div>12 個檔案（按主題載入）</div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-2">
        <h2 className="text-lg font-semibold">關於</h2>
        <div className="text-sm text-gray-400 space-y-1">
          <div>Discord Engagement Bot v1.0.0</div>
          <div>Claude World Taiwan</div>
          <a
            href="https://github.com/claude-world/discord-engagement-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            github.com/claude-world/discord-engagement-bot
          </a>
        </div>
      </div>
    </div>
  );
}
