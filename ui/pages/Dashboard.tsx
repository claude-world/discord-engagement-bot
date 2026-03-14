import React from 'react';
import { useStatus, useSchedule } from '../hooks/useIPC';
import StatusBar from '../components/StatusBar';

interface Props {
  compact?: boolean;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ compact, onNavigate }: Props) {
  const { status, loading, refresh } = useStatus();
  const { triggerJob } = useSchedule();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">載入中...</div>
      </div>
    );
  }

  // Compact menubar mode
  if (compact) {
    return (
      <div className="p-4 space-y-3">
        <StatusBar connected={status?.connected} />

        <div className="text-sm text-gray-400">
          今日已發: {status?.todayCount ?? 0}
        </div>

        {status?.lastPost && (
          <div className="text-xs text-gray-500">
            最近: {new Date(status.lastPost.timestamp).toLocaleTimeString('zh-TW')} #{status.lastPost.channel}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => triggerJob('dailyTip').then(() => refresh())}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
          >
            立即發送
          </button>
          <button
            onClick={() => onNavigate('commander')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
          >
            開啟指揮中心
          </button>
        </div>

        <div className="border-t border-gray-700 pt-2">
          <input
            type="text"
            placeholder="輸入指令..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget.value.trim();
                if (input) {
                  onNavigate('commander');
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <button onClick={() => onNavigate('settings')} className="hover:text-gray-300">設定</button>
          <button className="hover:text-gray-300">暫停</button>
          <button onClick={() => window.botAPI?.quit?.() ?? alert('請從終端關閉 bot')} className="hover:text-red-400">退出</button>
        </div>
      </div>
    );
  }

  // Full dashboard
  const enabledJobs = status?.schedule?.filter((j: any) => j.enabled) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">總覽</h1>
        <StatusBar connected={status?.connected} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-indigo-400">{status?.todayCount ?? 0}</div>
          <div className="text-sm text-gray-400 mt-1">今日已發送</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{enabledJobs.length}</div>
          <div className="text-sm text-gray-400 mt-1">排程啟用中</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-amber-400">
            {status?.connected ? 'ON' : 'OFF'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Bot 狀態</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => triggerJob('dailyTip').then(() => refresh())}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            發送每日技巧
          </button>
          <button
            onClick={() => triggerJob('discussion').then(() => refresh())}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            發送午間討論
          </button>
          <button
            onClick={() => onNavigate('commander')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            開啟指揮台
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            管理排程
          </button>
        </div>
      </div>

      {/* Recent activity */}
      {status?.lastPost && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">最近發送</h2>
          <div className="text-sm">
            <div className="text-gray-400">
              {new Date(status.lastPost.timestamp).toLocaleString('zh-TW')} - #{status.lastPost.channel}
            </div>
            <div className="mt-2 text-gray-300 line-clamp-3 whitespace-pre-wrap">
              {status.lastPost.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
