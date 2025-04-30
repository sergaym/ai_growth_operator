import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SendButton } from './SendButton';
import { UserPlus, Mic, Volume2 } from 'lucide-react';

type MessageType = 'gesture' | 'talking';
type SpeechType = 'tts' | 'stt';

export function GestureChat() {
  const [inputValue, setInputValue] = useState('');
  const [gesture, setGesture] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('gesture');
  const [speechType, setSpeechType] = useState<SpeechType>('tts');

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
          <div className="relative flex items-start gap-2 min-h-[80px] py-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a gesture, like 'Make the actor celebrate'"
              className="w-full text-sm text-zinc-900 bg-transparent placeholder:text-zinc-400 focus:outline-none resize-none pr-10"
              rows={3}
            />
            <SendButton
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="absolute bottom-2 right-0"
            />
          </div>
        </div>

        {/* Bottom Actions */}
          </div>
        </div>
      </div>
    </div>
  );
} 