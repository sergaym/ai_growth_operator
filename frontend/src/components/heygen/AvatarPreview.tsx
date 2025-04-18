import React, { useState } from 'react';
import { HeygenAvatar, HeygenVoice } from '@/types/heygen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, UserRound } from 'lucide-react';

interface AvatarPreviewProps {
  selectedAvatar: HeygenAvatar | undefined;
  selectedVoice: HeygenVoice | undefined;
  className?: string;
}
