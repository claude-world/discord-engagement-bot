import React from 'react';
import { useSchedule } from '../hooks/useIPC';
import ScheduleItem from '../components/ScheduleItem';

export default function Schedule() {
  const { schedule, updateJob, triggerJob } = useSchedule();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">排程管理</h1>

      <div className="space-y-3">
        {schedule.map((job) => (
          <ScheduleItem
            key={job.id}
            job={job}
            onToggle={(enabled) => updateJob(job.id, { enabled })}
            onUpdateCron={(cron) => updateJob(job.id, { cron })}
            onTrigger={() => triggerJob(job.id)}
          />
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          沒有排程項目
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
        <h3 className="font-semibold text-gray-300 mb-2">排程說明</h3>
        <ul className="space-y-1">
          <li>- 所有時間為 Asia/Taipei 時區</li>
          <li>- Cron 格式: 分 時 日 月 週</li>
          <li>- 例: <code className="text-gray-300">0 9 * * 1-5</code> = 週一到五 09:00</li>
          <li>- 修改後自動重新排程</li>
        </ul>
      </div>
    </div>
  );
}
