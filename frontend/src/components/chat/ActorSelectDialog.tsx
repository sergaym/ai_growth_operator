import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  image: string;
  tags: string[];
  hd?: boolean;
  pro?: boolean;
}

interface ActorSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActors: (actors: Actor[]) => void;
}
