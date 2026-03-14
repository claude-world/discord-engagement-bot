import React, { useState, useRef } from 'react';

interface Props {
  onSubmit: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function CommandInput({ onSubmit, placeholder, loading }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder ?? '輸入指令...'}
        className="flex-1 bg-transparent border-none text-sm focus:outline-none"
        disabled={loading}
      />
      {loading && (
        <span className="text-xs text-gray-500 animate-pulse">處理中...</span>
      )}
    </div>
  );
}
