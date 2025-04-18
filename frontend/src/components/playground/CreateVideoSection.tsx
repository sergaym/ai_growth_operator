import React from 'react';
import AvatarVideoForm from '@/components/heygen/AvatarVideoForm';
import { HeygenAvatar, HeygenVoice, HeygenVideoGenerationRequest } from '@/types/heygen';
import { Button } from '@/components/ui/button';

interface CreateVideoSectionProps {
  avatars: HeygenAvatar[];
  voices: HeygenVoice[];
  loadingAvatars: boolean;
  loadingVoices: boolean;
  avatarsError: string | null;
  voicesError: string | null;
  isGenerating: boolean;
  onVideoGenerated: (formData: HeygenVideoGenerationRequest) => Promise<any>;
  onRetryApiLoad: () => void;
}

export default function CreateVideoSection({
  avatars,
  voices,
  loadingAvatars,
  loadingVoices,
  avatarsError,
  voicesError,
  isGenerating,
  onVideoGenerated,
  onRetryApiLoad
}: CreateVideoSectionProps) {
  return (
    <div className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#e6e6e6] flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#37352f]">Create New Video</h2>
        
        {/* Loading or retry buttons */}
        {(loadingAvatars || loadingVoices) ? (
          <div className="flex items-center text-[#6b7280] text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-[#e6e6e6] border-t-[#37352f] rounded-full mr-2"></div>
            Loading...
          </div>
        ) : (avatarsError || voicesError) ? (
          <Button 
            variant="outline" 
            onClick={onRetryApiLoad}
            className="text-sm text-[#6b7280] border-[#e6e6e6]"
          >
            Retry API Connection
          </Button>
        ) : null}
      </div>
      
      <div className="p-6">
        {(loadingAvatars || loadingVoices) ? (
          <div className="py-12 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-[#e6e6e6] border-t-[#37352f] rounded-full mx-auto mb-4"></div>
            <p className="text-[#6b7280]">Loading avatars and voices...</p>
          </div>
        ) : (avatarsError || voicesError) ? (
          <div>
            <div className="mb-6 p-4 bg-[#fffaeb] border border-[#ffefc6] rounded-md text-[#92400e]">
              <p className="font-medium">Note: Using demo data because the API connection failed</p>
              <p className="text-sm mt-1 text-[#b54708]">{avatarsError || voicesError}</p>
            </div>
            <AvatarVideoForm
              onVideoGenerated={onVideoGenerated}
              avatars={avatars}
              voices={voices}
              isGenerating={isGenerating}
            />
          </div>
        ) : (
          <AvatarVideoForm
            onVideoGenerated={onVideoGenerated}
            avatars={avatars}
            voices={voices}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
} 