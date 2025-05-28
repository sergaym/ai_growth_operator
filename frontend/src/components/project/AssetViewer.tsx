import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  ExternalLink, 
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Clock,
  Share2,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle,
  Loader,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ProjectAsset } from '@/contexts/ProjectsContext';
