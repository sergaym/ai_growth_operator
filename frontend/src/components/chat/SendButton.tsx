import { Send } from 'lucide-react';
import React from 'react';

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

export function SendButton({ onClick, disabled, className = '' }: SendButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-all
        ${disabled 
          ? 'text-zinc-300 cursor-not-allowed' 
          : 'text-zinc-600 hover:bg-zinc-100 cursor-pointer'}
        ${className}`}
      aria-label="Send message"
    >
      <Send className="w-5 h-5" />
    </button>
  );
} 