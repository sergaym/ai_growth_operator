import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SendButton } from './SendButton';
import { UserPlus, Volume2, Globe, Lightbulb, Zap, Sparkles } from 'lucide-react';
import { ActorSelectDialog } from './ActorSelectDialog';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MessageType = 'gesture' | 'talking';

interface Actor {
  id: string;
  name: string;
  image: string;
  tags: string[];
  hd?: boolean;
  pro?: boolean;
  videoUrl?: string;
}

interface EnhancedGestureChatProps {
  projectId?: string;
  onGenerateVideo?: (text: string, actorId: string, actorVideoUrl: string, language: string) => Promise<void>;
  isGenerating?: boolean;
  showTips?: boolean;
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

// Example prompts to help users get started
const EXAMPLE_PROMPTS = {
  talking: [
    "Welcome to our AI video platform! I'm excited to show you what we can create together.",
    "Hello everyone! Let me introduce you to the future of content creation.",
    "Thanks for watching! Don't forget to subscribe and hit the notification bell.",
    "In today's video, I'll walk you through the most important features you need to know."
  ],
  gesture: [
    "Wave hello with enthusiasm and smile warmly",
    "Give a thumbs up and nod approvingly", 
    "Point to the side as if introducing something new",
    "Celebrate with raised arms and a big smile"
  ]
};

export function EnhancedGestureChat({ 
  projectId, 
  onGenerateVideo, 
  isGenerating: parentIsGenerating,
  showTips = true 
}: EnhancedGestureChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('talking');
  const [language, setLanguage] = useState('english');
  const [isActorDialogOpen, setIsActorDialogOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Auth context for user/workspace IDs
  const { user } = useAuth();

  // Use the parent's isGenerating state
  const isGenerating = parentIsGenerating || false;

  // Check if this is user's first time (you might want to use localStorage or user data)
  useEffect(() => {
    const hasUsedBefore = localStorage.getItem('ai-video-used-before');
    setIsFirstTime(!hasUsedBefore);
  }, []);

  // Mark as used when user generates their first video
  const markAsUsed = () => {
    localStorage.setItem('ai-video-used-before', 'true');
    setIsFirstTime(false);
  };

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

    // Mark as used on first generation
    if (isFirstTime) {
      markAsUsed();
    }

    // Call parent callback if provided
    if (onGenerateVideo) {
      try {
        await onGenerateVideo(inputValue.trim(), selectedActor.id, selectedActor.videoUrl, language);
        // Clear input after successful start
        setInputValue('');
        setShowExamples(false);
      } catch (error) {
        console.error('Failed to start video generation:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isGenerating) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    setShowExamples(false);
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

  // Get tooltip message based on current state
  const getTooltipMessage = () => {
    if (isGenerating) {
      return "Video generation in progress...";
    }
    if (!user?.isAuthenticated) {
      return "Please log in to generate videos";
    }
    if (!selectedActor) {
      return "Select an actor first";
    }
    if (!selectedActor.videoUrl) {
      return "Selected actor doesn't have a video available";
    }
    if (!inputValue.trim()) {
      return "Write a message to generate video";
    }
    return `Generate ${messageType === 'gesture' ? 'gesture' : 'talking'} video`;
  };

  const isButtonDisabled = !inputValue.trim() || isGenerating || !selectedActor || !user?.isAuthenticated;

  return (
    <>
      <div className="w-full space-y-4">
        {/* Getting Started Tips - Show for first-time users */}
        {isFirstTime && showTips && !selectedActor && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-slate-800">New to AI Videos? Here's how to get started:</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• <strong>Step 1:</strong> Click "Add actor" below to choose your AI presenter</p>
                    <p>• <strong>Step 2:</strong> Type what you want them to say or do</p>
                    <p>• <strong>Step 3:</strong> Watch your video generate in 2-3 minutes!</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Pro tip: Be specific for best results
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Chat Interface */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Selected Actor Display */}
          {selectedActor ? (
            <div className="px-3 pt-3 pb-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg transition-all duration-200 hover:from-blue-100 hover:to-purple-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-300 flex-shrink-0 bg-gray-100">
                  {selectedActor.videoUrl ? (
                    <video
                      src={selectedActor.videoUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={selectedActor.image || '/placeholder-avatar.jpg'}
                      alt={selectedActor.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-900">{selectedActor.name}</span>
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {selectedActor.pro && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Ready to create your video</p>
                </div>
                <button
                  onClick={() => setSelectedActor(null)}
                  className="text-blue-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-100 rounded-lg"
                  title="Remove actor"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Choose your AI actor</p>
                  <p className="text-xs text-gray-500 mt-1">Select from our gallery of professional AI presenters</p>
                </div>
                <button
                  onClick={handleAddActors}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Actors
                </button>
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div className="p-3 space-y-3">
            {/* User Authentication Status */}
            {!user?.isAuthenticated && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please log in to generate videos
                </p>
              </div>
            )}

            {/* Message Type and Language Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={messageType} onValueChange={(value) => setMessageType(value as MessageType)}>
                <SelectTrigger className="w-[160px] h-9 border border-slate-200 bg-white text-sm text-slate-700">
                  <SelectValue>
                    {messageType === 'gesture' ? (
                      <span className="flex items-center gap-1.5">👋 Gestures</span>
                    ) : (
                      <span className="flex items-center gap-1.5">🗣️ Talking</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gesture">👋 Gestures</SelectItem>
                  <SelectItem value="talking">🗣️ Talking</SelectItem>
                </SelectContent>
              </Select>

              {messageType === 'talking' && (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[160px] h-9 border border-slate-200 bg-white text-sm text-slate-700">
                    <SelectValue>
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        {LANGUAGES.find(l => l.value === language)?.label || 'Language'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Examples Button */}
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
              >
                <Sparkles className="h-4 w-4" />
                Examples
              </button>
            </div>

            {/* Example Prompts */}
            {showExamples && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  {messageType === 'gesture' ? 'Gesture Ideas' : 'Script Ideas'}
                </p>
                <div className="grid gap-2">
                  {EXAMPLE_PROMPTS[messageType].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-sm text-slate-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input Area */}
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messageType === 'gesture' 
                  ? "Describe the gesture you want the actor to perform, like 'Wave enthusiastically at the camera'" 
                  : "Write the script for your actor to speak"}
                className="w-full min-h-[80px] text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isGenerating}
              />
              
              {/* Send Button */}
              <div className="absolute bottom-3 right-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SendButton
                        onClick={handleSend}
                        disabled={isButtonDisabled}
                        loading={isGenerating}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    <p>{getTooltipMessage()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between px-3 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              {messageType === 'talking' && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600 px-3 py-1.5 bg-slate-100 rounded-md">
                  <Volume2 className="h-4 w-4" />
                  Text to Speech
                </div>
              )}
              
              {!selectedActor && (
                <button 
                  onClick={handleAddActors}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                  disabled={isGenerating}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Actor
                </button>
              )}
            </div>

            {/* Character count for long inputs */}
            {inputValue.length > 50 && (
              <div className="text-xs text-slate-500">
                {inputValue.length} characters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actor Select Dialog */}
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