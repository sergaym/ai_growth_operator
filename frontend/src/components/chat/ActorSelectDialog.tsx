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

export function ActorSelectDialog({ isOpen, onClose, onSelectActors }: ActorSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'my'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'young' | 'adult' | 'kid'>('all');
  const [hdFilter, setHdFilter] = useState(false);

  // Sample actor data - in a real app this would come from an API
  const actors: Actor[] = [
    { id: '1', name: 'Helen', image: '/actors/helen.jpg', tags: ['female', 'adult'], hd: true },
    { id: '2', name: 'Lauren', image: '/actors/lauren.jpg', tags: ['female', 'adult'], pro: true, hd: true },
    { id: '3', name: 'Thomas', image: '/actors/thomas.jpg', tags: ['male', 'adult'], hd: true },
    { id: '4', name: 'Charles', image: '/actors/charles.jpg', tags: ['male', 'adult'], hd: true },
    { id: '5', name: 'Violet', image: '/actors/violet.jpg', tags: ['female', 'adult'], pro: true, hd: true },
    { id: '6', name: 'Alicia', image: '/actors/alicia.jpg', tags: ['female', 'adult'] },
    { id: '7', name: 'Rebecca', image: '/actors/rebecca.jpg', tags: ['female', 'adult'] },
    { id: '8', name: 'Mia', image: '/actors/mia.jpg', tags: ['female', 'adult'] },
    { id: '9', name: 'Marcus', image: '/actors/marcus.jpg', tags: ['male', 'adult'] },
    { id: '10', name: 'David', image: '/actors/david.jpg', tags: ['male', 'adult'] },
  ];

  // Filter actors based on search and filters
  const filteredActors = actors.filter(actor => {
    // Search filter
    if (searchQuery && !actor.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Gender filter
    if (genderFilter !== 'all') {
      if (genderFilter === 'male' && !actor.tags.includes('male')) return false;
      if (genderFilter === 'female' && !actor.tags.includes('female')) return false;
    }
    
    // Age filter
    if (ageFilter !== 'all') {
      if (!actor.tags.includes(ageFilter)) return false;
    }
    
    // HD filter
    if (hdFilter && !actor.hd) return false;
    
    return true;
  });

