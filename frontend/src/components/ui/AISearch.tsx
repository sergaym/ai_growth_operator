import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Command, Zap, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Command+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsActive(true);
        setShowDropdown(true);
      }
      
      // Escape to blur and close
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsActive(false);
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (query.length === 0) {
          setIsActive(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);
  
  const executeSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Simulate search delay
    setTimeout(() => {
      onSearch(searchQuery);
      setIsSearching(false);
    }, 600);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Keep focus and execute search immediately
    setTimeout(() => {
      executeSearch(suggestion);
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchSuggestions.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          handleSuggestionSelect(searchSuggestions[selectedIndex]);
        } else {
          executeSearch(query);
        }
        break;
      case 'Tab':
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          e.preventDefault();
          setQuery(searchSuggestions[selectedIndex]);
          setSelectedIndex(-1);
        }
        break;
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
          isActive 
            ? 'border-blue-300 bg-white shadow-sm ring-1 ring-blue-100' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-1.5 text-gray-400">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          ) : isActive ? (
            <Sparkles className="h-4 w-4 text-blue-500" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
          placeholder={isActive ? placeholder : "Search with AI..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            
            // Show suggestions when typing is cleared
            if (e.target.value.length === 0 && isActive) {
              setShowDropdown(true);
            } else if (e.target.value.length > 0) {
              setShowDropdown(false);
            }
          }}
          onFocus={() => {
            setIsActive(true);
            if (query.length === 0) {
              setShowDropdown(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        
        {isActive && !isSearching && (
          <div className="flex items-center gap-2">
            {showDropdown && searchSuggestions.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                <span className="text-xs">Navigate</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Search suggestions dropdown */}
      {showDropdown && isActive && !isSearching && query.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-1 duration-200">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-gray-900">AI-powered search</span>
            </div>
            <p className="text-xs text-gray-500">
              Describe what you're looking for in natural language
            </p>
          </div>
          
          <div className="p-1 max-h-64 overflow-y-auto">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">SUGGESTIONS</div>
            {searchSuggestions.map((suggestion, i) => (
              <button
                key={i}
                className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-md mx-1 ${
                  selectedIndex === i
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-3.5 w-3.5 ${
                    selectedIndex === i ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↵ Select</span>
              <span>⇥ Autocomplete</span>
            </div>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-powered
            </span>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isSearching && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-4 animate-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Finding the perfect results...</p>
            <p className="text-xs text-gray-500 mt-1">Analyzing "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
} 