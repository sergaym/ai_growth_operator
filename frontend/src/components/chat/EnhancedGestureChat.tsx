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

