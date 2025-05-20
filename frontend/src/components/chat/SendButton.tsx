import { Send } from 'lucide-react';
import React from 'react';

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
  className?: string;
}

export function SendButton({ onClick, disabled, loading = false, className = '' }: SendButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`p-1.5 rounded-lg transition-all
        ${disabled || loading
          ? 'text-zinc-300 cursor-not-allowed' 
          : 'text-zinc-600 hover:bg-zinc-100 cursor-pointer'}
        ${className}`}
      aria-label="Send message"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Send className="w-5 h-5" />
      )}
    </button>
  );
} 