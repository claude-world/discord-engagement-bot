import React, { useState } from 'react';

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* Token */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Discord Bot Token</h2>
        <input
          type="password"
          placeholder="Bot token (from .env)"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          disabled
        />
        <p className="text-xs text-gray-500">
          Token 從 .env 檔案載入，不在 UI 中修改
        </p>
      </div>

      {/* Channel IDs */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">頻道設定</h2>
        {['daily-tips', 'general', 'announcements', 'bot-logs'].map((ch) => (
          <div key={ch} className="flex items-center gap-3">
            <label className="text-sm text-gray-400 w-32">#{ch}</label>
            <input
              type="text"
              placeholder="Channel ID"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
        ))}
        <p className="text-xs text-gray-500">
          頻道 ID 從 .env 檔案載入
        </p>
      </div>

      {/* CLI Config */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">內容生成</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400 w-32">CLI 路徑</label>
          <input
            type="text"
            defaultValue="claude"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400 w-32">逾時 (ms)</label>
          <input
            type="number"
            defaultValue="60000"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-2">
        <h2 className="text-lg font-semibold">關於</h2>
        <div className="text-sm text-gray-400 space-y-1">
          <div>Discord Engagement Bot v1.0.0</div>
          <div>Claude World Taiwan</div>
          <div className="text-xs text-gray-500">
            內容引擎: claude -p (本地 CLI, 零外部費用)
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        {saved ? '已儲存' : '儲存設定'}
      </button>
    </div>
  );
}
