import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, Users, Star, User, UserRound, UserCircle, Filter, Baby, UserCheck, Clock, Crown, SlidersHorizontal, Check, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { useActors, Actor, isValidVideoUrl } from '@/hooks/useActors';
import { AISearch } from '@/components/ui/AISearch';

// API base URL for assets
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  // Track loading state for each actor
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Add state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    gender: true,
    age: true,
    features: true
  });

  // AI search states
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);
  const [isAiResultVisible, setIsAiResultVisible] = useState(false);

  const toggleSection = (section: 'gender' | 'age' | 'features') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to resolve relative API URLs
  const resolveApiUrl = (relativeUrl?: string) => {
    if (!relativeUrl) return '/placeholder-avatar.jpg';
    
    // If it's already an absolute URL, return it as is
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Make sure the path starts with a slash
    const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `${API_BASE_URL}/api/v1${path}`;
  };

  // Helper to get a safe image URL (with fallback)
  const getSafeImageUrl = (url?: string) => {
    return url ? resolveApiUrl(url) : '/placeholder-avatar.jpg';
  };

  // Use our custom hook to fetch actors (videos) from the API
  const { actors, isLoading, error } = useActors({ 
    limit: 20, 
    status: 'completed' 
  });

  // Initialize loading states for all actors when they're fetched
  useEffect(() => {
    if (actors.length > 0) {
      const initialLoadingStates: { [key: string]: boolean } = {};
      actors.forEach(actor => {
        if (actor.videoUrl) {  // URLs are already validated in the useActors hook
          initialLoadingStates[actor.id] = true;
        }
      });
      setLoadingStates(initialLoadingStates);
    }
  }, [actors]);

  // Function to set loading state for a specific actor
  const setActorLoadingState = (actorId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [actorId]: isLoading
    }));
  };

  // Clean up videos when dialog closes
  useEffect(() => {
    // When the dialog opens, reset state
    if (isOpen) {
      setPlayingVideo(null);
    }
    
    // Clean up when dialog closes
    return () => {
      // Clean up all running videos
      Object.values(videoRefs.current).forEach(video => {
        try {
          if (video) {
            // Remove event listeners first
            const clonedVideo = video.cloneNode(true);
            if (video.parentNode) {
              video.parentNode.replaceChild(clonedVideo, video);
            }
            
            // Then stop the video
            video.pause();
            video.removeAttribute('src');
            video.load();
          }
        } catch (err) {
          console.error('Error cleaning up video:', err);
        }
      });
      
      // Clear the refs
      videoRefs.current = {};
      setPlayingVideo(null);
      setLoadingStates({});
    };
  }, [isOpen]);

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

  const toggleActorSelection = (actor: Actor) => {
    if (selectedActors.some(a => a.id === actor.id)) {
      setSelectedActors(selectedActors.filter(a => a.id !== actor.id));
    } else {
      setSelectedActors([...selectedActors, actor]);
    }
  };

  // This now toggles sound rather than playback
  const toggleVideoSound = (actorId: string) => {
    const video = videoRefs.current[actorId];
    if (!video) return;
    
    // If this video is currently unmuted, mute it
    if (playingVideo === actorId) {
      video.muted = true;
      setPlayingVideo(null);
    } else {
      // Mute any other playing video first
      if (playingVideo && videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo].muted = true;
      }
      
      // Unmute this video
      video.muted = false;
      setPlayingVideo(actorId);
    }
  };

  const handleConfirm = () => {
    onSelectActors(selectedActors);
    onClose();
  };

  // Handle AI search
  const handleAiSearch = (query: string) => {
    setAiQueryResult(query);
    setIsAiResultVisible(true);
    
    // In a real implementation, this would update the filtered actors based on AI analysis
    // For now, we're just displaying the query that would be processed
  };

  if (!isOpen) return null;

  const filterButtonClass = (isActive: boolean) => 
    `text-xs px-3 py-1.5 border rounded-md ${isActive ? 'bg-zinc-100 border-zinc-300' : 'border-zinc-200'}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Select actors</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-3 py-1.5 border border-zinc-200 rounded-lg w-60 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Tabs - Top Navigation */}
        <div className="border-b">
          <div className="flex">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={18} />
                <span>All Actors</span>
              </div>
            </button>

            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === 'favorites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveFilter('favorites')}
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={18} />
                <span>Favorites</span>
              </div>
            </button>

            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === 'my'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveFilter('my')}
            >
              <div className="flex items-center justify-center gap-2">
                <User size={18} />
                <span>My Actors</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar filters - now as collapsible sections */}
          <div className="w-56 border-r p-2 space-y-1 overflow-y-auto bg-gray-50">
            {/* Collapsible Gender Filter */}
            <div className="rounded-md overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('gender')}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span>Gender</span>
                </div>
                {expandedSections.gender ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              
              {expandedSections.gender && (
                <div className="space-y-1 px-2 pb-2">
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      genderFilter === 'all' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setGenderFilter('all')}
                  >
                    <Users size={16} className={genderFilter === 'all' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>All genders</span>
                    {genderFilter === 'all' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      genderFilter === 'male' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setGenderFilter(genderFilter === 'male' ? 'all' : 'male')}
                  >
                    <UserRound size={16} className={genderFilter === 'male' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>Male</span>
                    {genderFilter === 'male' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      genderFilter === 'female' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setGenderFilter(genderFilter === 'female' ? 'all' : 'female')}
                  >
                    <UserCircle size={16} className={genderFilter === 'female' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>Female</span>
                    {genderFilter === 'female' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible Age Filter */}
            <div className="rounded-md overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('age')}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span>Age Range</span>
                </div>
                {expandedSections.age ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              
              {expandedSections.age && (
                <div className="space-y-1 px-2 pb-2">
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      ageFilter === 'all' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setAgeFilter('all')}
                  >
                    <Users size={16} className={ageFilter === 'all' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>All ages</span>
                    {ageFilter === 'all' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      ageFilter === 'kid' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setAgeFilter(ageFilter === 'kid' ? 'all' : 'kid')}
                  >
                    <Baby size={16} className={ageFilter === 'kid' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>Child</span>
                    {ageFilter === 'kid' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      ageFilter === 'young' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setAgeFilter(ageFilter === 'young' ? 'all' : 'young')}
                  >
                    <User size={16} className={ageFilter === 'young' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>Young Adult</span>
                    {ageFilter === 'young' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      ageFilter === 'adult' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setAgeFilter(ageFilter === 'adult' ? 'all' : 'adult')}
                  >
                    <UserCheck size={16} className={ageFilter === 'adult' ? 'text-blue-700' : 'text-gray-500'} />
                    <span>Adult</span>
                    {ageFilter === 'adult' && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible Features Filter */}
            <div className="rounded-md overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('features')}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span>Features</span>
                </div>
                {expandedSections.features ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              
              {expandedSections.features && (
                <div className="space-y-1 px-2 pb-2">
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      hdFilter 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setHdFilter(!hdFilter)}
                  >
                    <Crown size={16} className={hdFilter ? 'text-blue-700' : 'text-gray-500'} />
                    <span>HD Quality</span>
                    {hdFilter && <Check size={16} className="ml-auto text-blue-700" />}
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 text-gray-700`}
                  >
                    <Clock size={16} className="text-gray-500" />
                    <span>Recently Added</span>
                  </button>
                  <button 
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 text-gray-700`}
                  >
                    <SlidersHorizontal size={16} className="text-gray-500" />
                    <span>More Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actor grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeFilter === 'favorites' ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Click the star icon on any actor to add them to your favorites for quick access.
                </p>
              </div>
            ) : activeFilter === 'my' ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create your own actors</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Upgrade to Pro to create and customize your own AI actors for your videos.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  Upgrade to Pro
                </button>
              </div>
            ) : isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : filteredActors.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <p>No actors match your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {filteredActors.map(actor => (
                  <div 
                    key={actor.id} 
                    className="group relative cursor-pointer"
                  >
                    <div 
                      className={`relative aspect-[3/4] overflow-hidden rounded-lg shadow-md ${
                        selectedActors.some(a => a.id === actor.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => toggleActorSelection(actor)}
                      style={{
                        backgroundImage: `url(${getSafeImageUrl(actor.image)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {actor.videoUrl ? (
                        <>
                          {/* Only show loading spinner if actor is in loading state */}
                          {loadingStates[actor.id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/20 z-10">
                              <div className="w-10 h-10 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                          )}
                          <video
                            ref={(el) => {
                              if (el) {
                                videoRefs.current[actor.id] = el;
                                
                                // Add event listener to hide loading spinner when video starts playing
                                el.addEventListener('playing', () => {
                                  setActorLoadingState(actor.id, false);
                                });
                                
                                // Add a timeout to hide spinner if video doesn't load within 5 seconds
                                setTimeout(() => {
                                  setActorLoadingState(actor.id, false);
                                }, 5000);
                              }
                            }}
                            src={getSafeImageUrl(actor.videoUrl)}
                            className="w-full h-full object-cover z-0"
                            muted
                            playsInline
                            loop
                            autoPlay
                            preload="auto"
                            onLoadStart={() => {
                              setActorLoadingState(actor.id, true);
                            }}
                            onCanPlay={() => {
                              setActorLoadingState(actor.id, false);
                            }}
                            onError={(e) => {
                              console.error(`Error loading video for ${actor.name || actor.id}`, e);
                              setActorLoadingState(actor.id, false);
                              
                              // If video fails to load, use the fallback image
                              try {
                                const target = e.target as HTMLVideoElement;
                                if (target) {
                                  target.style.display = 'none'; // Hide the video element
                                }
                              } catch (err) {
                                console.error('Error handling video failure:', err);
                              }
                            }}
                          />
                        </>
                      ) : (
                        <img 
                          src={getSafeImageUrl(actor.image)}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-avatar.jpg';
                          }}
                        />
                      )}
                      
                      {/* Control overlay - now just for sound control */}
                      {actor.videoUrl && (
                        <button
                          className="absolute bottom-3 left-3 flex items-center justify-center bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering selection
                            toggleVideoSound(actor.id);
                          }}
                        >
                          {playingVideo === actor.id ? (
                            <span className="text-white text-sm px-1">🔊</span>
                          ) : (
                            <span className="text-white text-sm px-1">🔇</span>
                          )}
                        </button>
                      )}
                      
                      {actor.pro && (
                        <div className="absolute top-3 left-3 bg-zinc-800 text-white text-xs px-2 py-0.5 rounded">
                          PRO
                        </div>
                      )}
                      {actor.hd && (
                        <div className="absolute bottom-3 right-3 bg-zinc-800 text-white text-xs px-2 py-0.5 rounded">
                          HD
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-sm font-medium truncate">{actor.name}</p>
                      {actor.videoUrl && (
                        <button 
                          className="text-sm text-blue-500 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoSound(actor.id);
                          }}
                        >
                          {playingVideo === actor.id ? 'Mute' : 'Unmute'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm">
            {selectedActors.length} {selectedActors.length === 1 ? 'actor' : 'actors'} selected
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 border border-zinc-200 rounded text-sm hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="px-5 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={selectedActors.length === 0}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 