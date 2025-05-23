import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SendButton } from './SendButton';
import { UserPlus, Mic, Volume2, Globe, Play, Download } from 'lucide-react';
import { ActorSelectDialog } from './ActorSelectDialog';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { useAuth } from '@/hooks/useAuth';

type MessageType = 'gesture' | 'talking';
type SpeechType = 'tts' | 'stt';

interface Actor {
  id: string;
  name: string;
  image: string;
  tags: string[];
  hd?: boolean;
  pro?: boolean;
  videoUrl?: string;
}

interface GestureChatProps {
  projectId?: string;
  onVideoGenerated?: (url: string) => void;
}

// Language options for TTS
const LANGUAGES = [
  { value: 'english', label: '🇺🇸 English' },
  { value: 'spanish', label: '🇪🇸 Spanish' },
  { value: 'french', label: '🇫🇷 French' },
  { value: 'german', label: '🇩🇪 German' },
  { value: 'italian', label: '🇮🇹 Italian' },
  { value: 'portuguese', label: '🇵🇹 Portuguese' },
  { value: 'polish', label: '🇵🇱 Polish' },
  { value: 'turkish', label: '🇹🇷 Turkish' },
  { value: 'russian', label: '🇷🇺 Russian' },
  { value: 'dutch', label: '🇳🇱 Dutch' },
  { value: 'czech', label: '🇨🇿 Czech' },
  { value: 'arabic', label: '🇸🇦 Arabic' },
  { value: 'chinese', label: '🇨🇳 Chinese' },
  { value: 'japanese', label: '🇯🇵 Japanese' },
  { value: 'korean', label: '🇰🇷 Korean' },
];

export function GestureChat({ projectId, onVideoGenerated }: GestureChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('talking');
  const [speechType, setSpeechType] = useState<SpeechType>('tts');
  const [language, setLanguage] = useState('english');
  const [isActorDialogOpen, setIsActorDialogOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  // Auth context for user/workspace IDs
  const { user } = useAuth();

  // Video generation hook
  const { 
    generateVideo, 
    isGenerating, 
    progress, 
    currentStep, 
    result, 
    error, 
    cancel, 
    reset 
  } = useVideoGeneration({
    onComplete: (result) => {
      console.log('Video generation completed:', result);
      if (onVideoGenerated && result.video_url) {
        onVideoGenerated(result.video_url);
      }
    },
    onProgress: (progress, step) => {
      console.log(`Progress: ${progress}% - ${step}`);
    }
  });

  // Add error boundary-like error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('video')) {
        console.warn('Video loading error caught and handled:', event.error);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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

    // Validate actor is selected
    if (!selectedActor) {
      alert('Please select an actor first');
      return;
    }

    // Validate actor has video URL
    if (!selectedActor.videoUrl) {
      alert('Selected actor does not have a video available');
      return;
    }

    // Validate user is authenticated
    if (!user?.isAuthenticated || !user?.user) {
      alert('Please log in to generate videos');
      return;
    }

    try {
      const requestData = {
        text: inputValue.trim(),
        actor_id: String(selectedActor.id),
        actor_video_url: selectedActor.videoUrl,
        language: language,
        voice_preset: 'professional_male', // Could be dynamic based on actor
        project_id: projectId,
        user_id: String(user.user.id),
        workspace_id: user.user.workspaces?.[0]?.id ? String(user.user.workspaces[0].id) : undefined,
      };

      console.log('Sending video generation request:', requestData);
      
      await generateVideo(requestData);

      // Clear input after successful start
      setInputValue('');
      
    } catch (error) {
      console.error('Failed to start video generation:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isGenerating) {
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
      const validActor = (actors || []).find(actor => {
        return actor && typeof actor === 'object' && actor.id && actor.name;
      });
      
      setSelectedActor(validActor || null);
      console.log('Selected actor:', validActor);
    } catch (error) {
      console.error('Error selecting actor:', error);
      setSelectedActor(null);
    }
  };

  const handleCloseActorDialog = () => {
    try {
      setIsActorDialogOpen(false);
    } catch (error) {
      console.error('Error closing actor dialog:', error);
      setIsActorDialogOpen(false);
    }
  };

  const handlePlayVideo = () => {
    if (result?.video_url) {
      window.open(result.video_url, '_blank');
    }
  };

  const handleDownloadVideo = () => {
    if (result?.video_url) {
      const a = document.createElement('a');
      a.href = result.video_url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Shared styles
  const selectTriggerStyles = "w-[160px] h-9 border border-zinc-100 bg-zinc-50/50 text-sm text-zinc-600 px-3 py-1";
  const speechSelectStyles = "w-[190px] h-9 border border-zinc-100 bg-zinc-50/50 text-sm text-zinc-600 px-3 py-1";
  const buttonStyles = "inline-flex items-center gap-1.5 text-sm text-zinc-600 h-9 px-3 hover:bg-zinc-100 rounded-md transition-colors border border-zinc-100 bg-zinc-50/50";

  return (
    <>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Selected Actor Display */}
          {selectedActor ? (
            <div className="px-3 pt-3 pb-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-100 rounded-lg transition-all duration-200 hover:bg-blue-100/50">
                <div 
                  className="w-10 h-10 rounded-lg bg-cover bg-center border-2 border-blue-200 flex-shrink-0"
                  style={{
                    backgroundImage: `url(${selectedActor.image || '/placeholder-avatar.jpg'})`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900">{selectedActor.name}</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600">Active actor for this conversation</p>
                </div>
                <button
                  onClick={() => setSelectedActor(null)}
                  className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                  title="Remove actor"
                >
                  <span className="text-sm">×</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-100 rounded-lg border-dashed">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">No actor selected</p>
                  <p className="text-xs text-gray-500">Choose an actor to bring your content to life</p>
                </div>
              </div>
            </div>
          )}

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
                {selectedActor ? 'Change actor' : 'Add actor'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wrap ActorSelectDialog in error boundary-like handling */}
      {isActorDialogOpen && (
        <ActorSelectDialog 
          isOpen={isActorDialogOpen}
          onClose={handleCloseActorDialog}
          onSelectActors={handleSelectActors}
        />
      )}
    </>
  );
} 