import React from 'react';

interface Props {
  content: string;
  channel: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  tip: 'border-indigo-500',
  discussion: 'border-purple-500',
  roundup: 'border-amber-500',
  announcement: 'border-red-500',
  custom: 'border-gray-500',
};

export default function PostPreview({ content, channel, type }: Props) {
  return (
    <div className={`bg-gray-800 rounded-xl p-4 border-l-4 ${TYPE_COLORS[type] ?? 'border-gray-500'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 uppercase">{type}</span>
        <span className="text-xs text-gray-600">|</span>
        <span className="text-xs text-gray-500">#{channel}</span>
      </div>
      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        {content.length} 字
      </div>
    </div>
  );
}
