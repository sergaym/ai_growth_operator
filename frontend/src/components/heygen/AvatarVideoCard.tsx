import React, { useEffect } from 'react';
import { useHeygenVideoStatus } from '@/hooks/useHeygenApi';
import { TrackedVideoGeneration } from '@/types/heygen';

interface AvatarVideoCardProps {
  generation: TrackedVideoGeneration;
  onUpdate: (updatedGeneration: TrackedVideoGeneration) => void;
}

