import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'outline';
}

interface VideoListProps {
  title: string;
  count: number;
  loading?: boolean;
  error?: string | null;
  noItemsMessage: string;
  onRefresh?: () => void;
  renderItems: () => ReactNode;
  showRefreshButton?: boolean;
  onRetry?: () => void;
  actionButton?: ActionButton;
}

export default function VideoList({
  title,
  count,
  loading = false,
  error = null,
  noItemsMessage,
  onRefresh,
  renderItems,
  showRefreshButton = false,
  onRetry,
  actionButton
}: VideoListProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-medium text-[#37352f] flex items-center">
          <span>{title}</span>
          {count > 0 && (
            <span className="ml-2 bg-[#f1f1f1] text-[#6b7280] rounded-full px-2 py-0.5 text-xs font-normal">
              {count}
            </span>
          )}
        </h2>
        
        <div className="flex space-x-2">
          {/* Show action button if provided */}
          {actionButton && count > 0 && (
            <Button
              variant={actionButton.variant === 'danger' ? 'destructive' : (actionButton.variant || 'default')}
              size="sm"
              onClick={actionButton.onClick}
              className="text-sm"
            >
              {actionButton.label}
            </Button>
          )}
          
          {/* Refresh button */}
          {showRefreshButton && onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="text-sm text-[#6b7280] border-[#e6e6e6]"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="py-12 text-center border border-dashed border-[#e6e6e6] rounded-lg bg-[#fafafa]">
          <div className="animate-spin h-10 w-10 border-4 border-[#e6e6e6] border-t-[#37352f] rounded-full mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Loading...</p>
        </div>
      ) : error ? (
        <div className="py-6 text-center border border-dashed border-[#ffcdd2] rounded-lg bg-[#ffebee]">
          <p className="text-[#d32f2f] mb-2">Error loading {title.toLowerCase()}</p>
          <p className="text-[#6b7280] text-sm">{error}</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry}
              className="mt-4 text-sm text-[#d32f2f] border-[#ffcdd2]"
            >
              Try Again
            </Button>
          )}
        </div>
      ) : count === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#e6e6e6] rounded-lg bg-[#fafafa]">
          <p className="text-[#6b7280]">{noItemsMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {renderItems()}
        </div>
      )}
    </div>
  );
} 