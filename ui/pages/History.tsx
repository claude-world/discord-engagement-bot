import React, { useState } from 'react';
import { useHistory } from '../hooks/useIPC';

const TYPE_LABELS: Record<string, string> = {
  tip: '技巧',
  discussion: '討論',
  roundup: '週報',
  command: '指令',
  other: '其他',
};

const TYPE_COLORS: Record<string, string> = {
  tip: 'bg-indigo-600',
  discussion: 'bg-purple-600',
  roundup: 'bg-amber-600',
  command: 'bg-green-600',
  other: 'bg-gray-600',
};

export default function History() {
  const [filter, setFilter] = useState<string>('');
  const { records, refresh } = useHistory(filter ? { type: filter } : undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">發送歷史</h1>
        <button
          onClick={refresh}
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          重新整理
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('')}
          className={`text-sm px-3 py-1 rounded-lg ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          全部
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm px-3 py-1 rounded-lg ${filter === key ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-2">
        {records.map((record: any) => (
          <div
            key={record.id}
            className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-750"
            onClick={() => setExpanded(expanded === record.id ? null : record.id)}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS[record.type] ?? 'bg-gray-600'}`}>
                {TYPE_LABELS[record.type] ?? record.type}
              </span>
              <span className="text-sm text-gray-400">
                #{record.channel}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(record.timestamp).toLocaleString('zh-TW')}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${record.source === 'scheduled' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
                {record.source === 'scheduled' ? '排程' : '手動'}
              </span>
            </div>
            {expanded === record.id ? (
              <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap border-t border-gray-700 pt-3">
                {record.content}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-400 truncate">
                {record.content.slice(0, 100)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {records.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          還沒有發送紀錄
        </div>
      )}
    </div>
  );
}
