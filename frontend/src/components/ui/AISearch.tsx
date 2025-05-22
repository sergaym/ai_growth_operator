import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Command, Zap } from 'lucide-react';

// AI Search Component
interface AISearchProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  searchSuggestions?: string[];
}

export function AISearch({ 
  onSearch, 
  className = '',
  placeholder = "Describe the perfect actor...",
  searchSuggestions = [
    "Actor with a professional appearance",
    "Female with long dark hair",
    "Male actor with glasses and beard",
    "Young professional in business attire",
    "Friendly face for customer service video"
  ]
}: AISearchProps) {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Command+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsActive(true);
      }
      
      // Escape to blur and close
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsActive(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      onSearch(query);
      setIsSearching(false);
    }, 600);
  };
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
          isActive 
            ? 'border-blue-300 bg-white shadow-sm' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => {
          inputRef.current?.focus();
          setIsActive(true);
        }}
      >
        <div className="flex items-center gap-1.5 text-gray-400">
          {isActive ? (
            <Sparkles className="h-4 w-4 text-blue-500" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
          placeholder={isActive ? placeholder : "Search..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => query.length === 0 && setIsActive(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        
        {isActive && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        )}
      </div>
      
      {/* Search suggestions dropdown */}
      {isActive && !isSearching && query.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white rounded-lg border border-gray-200 shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-gray-900">AI-powered search</span>
            </div>
            <p className="text-xs text-gray-500">
              Describe what you're looking for in natural language
            </p>
          </div>
          
          <div className="p-2 max-h-64 overflow-y-auto">
            <div className="text-xs font-medium text-gray-500 px-2 py-1.5">SUGGESTIONS</div>
            {searchSuggestions.map((suggestion, i) => (
              <button
                key={i}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => {
                  setQuery(suggestion);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div className="p-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>Press Enter to search</span>
            <span>AI-powered results</span>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isSearching && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white rounded-lg border border-gray-200 shadow-lg z-10 p-4 flex flex-col items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <Sparkles className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-sm text-gray-700 font-medium">Finding the perfect results...</p>
            <p className="text-xs text-gray-500 mt-1">Analyzing "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
} 