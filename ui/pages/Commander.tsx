import React, { useState, useRef } from 'react';
import { useCommander } from '../hooks/useIPC';
import PostPreview from '../components/PostPreview';

const QUICK_COMMANDS = [
  { label: '每日技巧', value: '發技巧' },
  { label: '午間討論', value: '發討論' },
  { label: '週報', value: '發週報' },
];

export default function Commander() {
  const [input, setInput] = useState('');
  const { loading, preview, parse, execute, setPreview } = useCommander();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    await parse(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">指揮台</h1>

      {/* Quick commands */}
      <div className="flex gap-2">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.value}
            disabled={loading}
            onClick={() => { setInput(cmd.value); parse(cmd.value); }}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-gray-800 rounded-xl p-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入指令... 例如：發一篇關於 MCP 設定的進階技巧"
          className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:border-indigo-500 min-h-[80px]"
          rows={3}
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-500">
            Cmd+Enter 生成預覽
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? '生成中...' : '生成預覽'}
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <PostPreview
            content={preview.content}
            channel={preview.channel}
            type={preview.intent}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              發送到: #{preview.channel}
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setPreview(null)}
              className="text-gray-400 hover:text-gray-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={execute}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '發送中...' : '發送'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
