import React from 'react';

interface Props {
  connected?: boolean;
}

export default function StatusBar({ connected }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Claude World Bot</span>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
      <span className="text-xs text-gray-400">
        {connected ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
