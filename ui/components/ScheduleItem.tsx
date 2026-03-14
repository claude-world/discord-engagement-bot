import React, { useState } from 'react';

interface Props {
  job: {
    id: string;
    name: string;
    cron: string;
    channel: string;
    enabled: boolean;
    type: string;
  };
  onToggle: (enabled: boolean) => void;
  onUpdateCron: (cron: string) => void;
  onTrigger: () => void;
}

export default function ScheduleItem({ job, onToggle, onUpdateCron, onTrigger }: Props) {
  const [editing, setEditing] = useState(false);
  const [cronValue, setCronValue] = useState(job.cron);

  const handleSaveCron = () => {
    onUpdateCron(cronValue);
    setEditing(false);
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-4 ${!job.enabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Toggle */}
        <button
          onClick={() => onToggle(!job.enabled)}
          className={`w-10 h-6 rounded-full relative transition-colors ${
            job.enabled ? 'bg-indigo-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              job.enabled ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>

        <div className="flex-1">
          <div className="font-medium text-sm">{job.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            #{job.channel}
          </div>
        </div>

        {/* Cron display / edit */}
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={cronValue}
              onChange={(e) => setCronValue(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCron()}
            />
            <button onClick={handleSaveCron} className="text-xs text-green-400 hover:text-green-300">
              存
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-300">
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-gray-200 font-mono bg-gray-900 px-2 py-1 rounded"
          >
            {job.cron}
          </button>
        )}

        {/* Trigger now */}
        <button
          onClick={onTrigger}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          title="立即執行"
        >
          執行
        </button>
      </div>
    </div>
  );
}
