import React, { useState, useRef, useEffect } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';
import { useActors, Actor, isValidVideoUrl } from '@/hooks/useActors';

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

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar filters */}
          <div className="w-48 border-r p-4 space-y-6 overflow-y-auto">
            {/* Actor type filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="all-actors" 
                  checked={activeFilter === 'all'} 
                  onChange={() => setActiveFilter('all')}
                />
                <label htmlFor="all-actors" className="text-sm">All actors</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="favorites" 
                  checked={activeFilter === 'favorites'} 
                  onChange={() => setActiveFilter('favorites')}
                />
                <label htmlFor="favorites" className="text-sm">Favorites</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="my-actors" 
                  checked={activeFilter === 'my'} 
                  onChange={() => setActiveFilter('my')}
                />
                <label htmlFor="my-actors" className="text-sm">My actors</label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-sm">Gender</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className={filterButtonClass(genderFilter === 'male')}
                  onClick={() => setGenderFilter(genderFilter === 'male' ? 'all' : 'male')}
                >
                  Male
                </button>
                <button 
                  className={filterButtonClass(genderFilter === 'female')}
                  onClick={() => setGenderFilter(genderFilter === 'female' ? 'all' : 'female')}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-sm">Age</h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  className={filterButtonClass(ageFilter === 'young')}
                  onClick={() => setAgeFilter(ageFilter === 'young' ? 'all' : 'young')}
                >
                  Young Adult
                </button>
                <button 
                  className={filterButtonClass(ageFilter === 'adult')}
                  onClick={() => setAgeFilter(ageFilter === 'adult' ? 'all' : 'adult')}
                >
                  Adult
                </button>
                <button 
                  className={filterButtonClass(ageFilter === 'kid')}
                  onClick={() => setAgeFilter(ageFilter === 'kid' ? 'all' : 'kid')}
                >
                  Kid
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-sm">Order</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-xs px-3 py-1.5 border rounded-md border-zinc-200">
                  Newly Added
                </button>
                <button 
                  className={filterButtonClass(hdFilter)}
                  onClick={() => setHdFilter(!hdFilter)}
                >
                  HD
                </button>
              </div>
            </div>
          </div>

          {/* Actor grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
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