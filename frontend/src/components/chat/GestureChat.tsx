import React, { useState } from 'react';
import { Send } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GestureChat() {
  const [inputValue, setInputValue] = useState('');
  const [gesture, setGesture] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      // Handle send message here
      console.log('Sending:', { gesture, message: inputValue });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100">
        {/* Top Input Area */}
        <div className="p-2 space-y-1">
          {/* Gesture Selector and Input */}
          <div className="flex items-center gap-2">
            <Select value={gesture} onValueChange={setGesture}>
              <SelectTrigger className="w-[140px] h-8 border border-zinc-100 bg-zinc-50/50 text-sm text-zinc-600 px-2.5 py-1">
                <SelectValue placeholder="👋 Gestures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wave">👋 Wave</SelectItem>
                <SelectItem value="clap">👏 Clap</SelectItem>
                <SelectItem value="point">👉 Point</SelectItem>
                <SelectItem value="thumbsup">👍 Thumbs Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe a gesture, like 'Make the actor celebrate'"
              className="w-full text-sm text-zinc-900 bg-transparent placeholder:text-zinc-400 focus:outline-none"
            />
            <button 
              className="text-zinc-500 hover:text-zinc-600 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-100 bg-zinc-50/50">
          <button className="inline-flex items-center gap-2 text-xs text-zinc-600">
            👥 Add actors
          </button>
          <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100">
            <span className="text-[10px] font-medium text-zinc-600">?</span>
          </button>
        </div>
      </div>
    </div>
  );
} 