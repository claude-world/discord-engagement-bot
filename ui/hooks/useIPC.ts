import { useState, useEffect, useCallback } from 'react';

// Type the window.botAPI from preload
declare global {
  interface Window {
    botAPI?: {
      getStatus(): Promise<any>;
      parseCommand(input: string): Promise<any>;
      executeCommand(cmd: any): Promise<void>;
      getSchedule(): Promise<any[]>;
      updateJob(id: string, updates: any): Promise<void>;
      triggerJob(id: string): Promise<void>;
      getHistory(opts?: any): Promise<any[]>;
      getChannels(): Promise<string[]>;
      openCommandCenter(): void;
      quit(): void;
      onStatusUpdate(callback: (status: string) => void): () => void;
    };
  }
}

const electronAPI = window.botAPI;

// HTTP fallback for non-Electron mode
const API_BASE = 'http://localhost:3456';

const httpAPI = {
  getStatus: () => fetch(`${API_BASE}/api/status`).then(r => r.json()),
  parseCommand: (input: string) =>
    fetch(`${API_BASE}/api/commander/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    }).then(r => r.json()),
  executeCommand: (cmd: any) =>
    fetch(`${API_BASE}/api/commander/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd),
    }).then(r => r.json()),
  getSchedule: () => fetch(`${API_BASE}/api/schedule`).then(r => r.json()),
  updateJob: (id: string, updates: any) =>
    fetch(`${API_BASE}/api/schedule/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    }).then(r => r.json()),
  triggerJob: (id: string) =>
    fetch(`${API_BASE}/api/schedule/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(r => r.json()),
  getHistory: (opts?: any) => fetch(`${API_BASE}/api/history`).then(r => r.json()),
  getChannels: () => fetch(`${API_BASE}/api/channels`).then(r => r.json()),
};

const api = electronAPI ?? httpAPI;

// Check if running in Electron
export function useIsElectron(): boolean {
  return !!electronAPI;
}

export function useStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await api.getStatus();
      setStatus(s);
    } catch (err) {
      console.error('Failed to get status:', err);
      setStatus({ connected: false, todayCount: 0, schedule: [] });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, loading, refresh };
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    try {
      const s = await api.getSchedule();
      setSchedule(s);
    } catch (err) {
      console.error('Failed to get schedule:', err);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateJob = useCallback(async (id: string, updates: any) => {
    await api.updateJob(id, updates);
    await refresh();
  }, [refresh]);

  const triggerJob = useCallback(async (id: string) => {
    await api.triggerJob(id);
  }, []);

  return { schedule, refresh, updateJob, triggerJob };
}

export function useHistory(opts?: any) {
  const [records, setRecords] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    try {
      const r = await api.getHistory(opts);
      setRecords(r);
    } catch (err) {
      console.error('Failed to get history:', err);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { records, refresh };
}

export function useCommander() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const parse = useCallback(async (input: string) => {
    setLoading(true);
    try {
      const result = await api.parseCommand(input);
      setPreview(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const execute = useCallback(async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await api.executeCommand(preview);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [preview]);

  return { loading, preview, parse, execute, setPreview };
}
