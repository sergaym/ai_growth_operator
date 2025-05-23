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

