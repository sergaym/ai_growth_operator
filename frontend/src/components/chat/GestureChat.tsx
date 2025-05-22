import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SendButton } from './SendButton';
import { UserPlus, Mic, Volume2 } from 'lucide-react';
import { ActorSelectDialog } from './ActorSelectDialog';

type MessageType = 'gesture' | 'talking';
type SpeechType = 'tts' | 'stt';

interface Actor {
  id: string;
  name: string;
  image: string;
  tags: string[];
  hd?: boolean;
  pro?: boolean;
}

interface GestureChatProps {
  projectId?: string;
  onVideoGenerated?: (url: string) => void;
}

export function GestureChat({ projectId, onVideoGenerated }: GestureChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [gesture, setGesture] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('gesture');
  const [speechType, setSpeechType] = useState<SpeechType>('tts');
  const [isActorDialogOpen, setIsActorDialogOpen] = useState(false);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add error boundary-like error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Prevent video loading errors from breaking the UI
      if (event.error && event.error.message && event.error.message.includes('video')) {
        console.warn('Video loading error caught and handled:', event.error);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Handle promise rejections that might come from video loading
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('video')) {
        console.warn('Promise rejection caught and handled:', event.reason);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    try {
      // Validate selected actors before sending
      const validActors = selectedActors.filter(actor => actor && actor.id && actor.name);
      
      // Handle send message here
      console.log('Sending:', { 
        projectId,
        type: messageType, 
        speechType, 
        gesture, 
        message: inputValue, 
        selectedActors: validActors
      });
      
      // Simulate video generation
      if (onVideoGenerated) {
        setIsGenerating(true);
        
        try {
          // Mock API call - replace with real API call
          await new Promise((resolve) => {
            setTimeout(() => {
              // Example video URL - in a real app this would come from the API
              const mockVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
              onVideoGenerated(mockVideoUrl);
              resolve(mockVideoUrl);
            }, 2000);
          });
        } catch (error) {
          console.error('Error generating video:', error);
          // Could show user-friendly error message here
        } finally {
          setIsGenerating(false);
        }
      }
      
      setInputValue('');
    } catch (error) {
      console.error('Error in handleSend:', error);
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddActors = () => {
    try {
      setIsActorDialogOpen(true);
    } catch (error) {
      console.error('Error opening actor dialog:', error);
    }
  };

  const handleSelectActors = (actors: Actor[]) => {
    try {
      // Validate actors before setting them
      const validActors = (actors || []).filter(actor => {
        return actor && typeof actor === 'object' && actor.id && actor.name;
      });
      
      setSelectedActors(validActors);
      console.log('Selected actors:', validActors);
    } catch (error) {
      console.error('Error selecting actors:', error);
      setSelectedActors([]);
    }
  };

  const handleCloseActorDialog = () => {
    try {
      setIsActorDialogOpen(false);
    } catch (error) {
      console.error('Error closing actor dialog:', error);
      // Force close anyway
      setIsActorDialogOpen(false);
    }
  };

  // Shared select styles for consistency
  const selectTriggerStyles = "w-[160px] h-9 border border-zinc-100 bg-zinc-50/50 text-sm text-zinc-600 px-3 py-1";
  const speechSelectStyles = "w-[190px] h-9 border border-zinc-100 bg-zinc-50/50 text-sm text-zinc-600 px-3 py-1";
  
  // Shared button styles with border matching select component
  const buttonStyles = "inline-flex items-center gap-1.5 text-sm text-zinc-600 h-9 px-3 hover:bg-zinc-100 rounded-md transition-colors border border-zinc-100 bg-zinc-50/50";

  return (
    <>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Top Input Area */}
          <div className="p-3 space-y-2">
            {/* Message Type Selector */}
            <div className="flex items-center gap-2">
              <Select value={messageType} onValueChange={(value) => setMessageType(value as MessageType)}>
                <SelectTrigger className={selectTriggerStyles}>
                  <SelectValue>
                    {messageType === 'gesture' ? (
                      <span className="flex items-center gap-1.5">👋 Gestures</span>
                    ) : (
                      <span className="flex items-center gap-1.5">🗣️ Talking Actors</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gesture">👋 Gestures</SelectItem>
                  <SelectItem value="talking">🗣️ Talking Actors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex items-start gap-2 min-h-[60px]">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messageType === 'gesture' 
                  ? "Describe a gesture, like 'Make the actor celebrate'" 
                  : "Write dialogue for the actor to speak"}
                className="w-full text-sm text-zinc-900 bg-transparent placeholder:text-zinc-400 focus:outline-none resize-none pr-10"
                rows={2}
              />
              <SendButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isGenerating}
                loading={isGenerating}
                className="absolute bottom-0 right-0"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              {messageType === 'talking' ? (
                <>
                  <Select value={speechType} onValueChange={(value) => setSpeechType(value as SpeechType)}>
                    <SelectTrigger className={speechSelectStyles}>
                      <SelectValue>
                        {speechType === 'tts' ? (
                          <span className="flex items-center gap-1.5">
                            <Volume2 className="h-4 w-4" />
                            Text to Speech
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Mic className="h-4 w-4" />
                            Speech to Speech
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tts">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="h-4 w-4" />
                          Text to Speech
                        </span>
                      </SelectItem>
                      <SelectItem value="stt">
                        <span className="flex items-center gap-1.5">
                          <Mic className="h-4 w-4" />
                          Speech to Speech
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : null}
              <button 
                onClick={handleAddActors}
                className={buttonStyles}
                disabled={isGenerating}
              >
                <UserPlus className="h-4 w-4" />
                Add actors
              </button>
            </div>
          </div>
        </div>
      </div>

      <ActorSelectDialog 
        isOpen={isActorDialogOpen}
        onClose={() => setIsActorDialogOpen(false)}
        onSelectActors={handleSelectActors}
      />
    </>
  );
} 