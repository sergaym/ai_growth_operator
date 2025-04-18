import React, { useState } from 'react';
import { DatabaseAvatarVideo } from '@/types/heygen';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DatabaseVideoCardProps {
  video: DatabaseAvatarVideo;
}

export default function DatabaseVideoCard({ video }: DatabaseVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Format timestamps
  const createdAt = new Date(video.created_at);
  const formattedCreatedAt = format(createdAt, 'MMM d, yyyy h:mm a');
  
  // Format status with proper capitalization
  const formattedStatus = video.status.charAt(0).toUpperCase() + video.status.slice(1);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {video.avatar_name || `Avatar: ${video.avatar_id}`}
            </CardTitle>
            <CardDescription>
              Created: {formattedCreatedAt}
            </CardDescription>
          </div>
          
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              video.status === 'completed' ? 'bg-green-100 text-green-800' : 
              video.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {formattedStatus}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="mb-3 text-sm">
          <p className="line-clamp-2 text-gray-700">{video.prompt}</p>
        </div>
        
        {video.video_url && (
          <div className="mt-3 rounded-md overflow-hidden bg-gray-50">
            <video
              controls
              width="100%"
              height="auto"
              poster={video.thumbnail_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full rounded-md"
            >
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        {!video.video_url && video.status === 'completed' && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-500">Video is marked as completed but no URL is available</p>
          </div>
        )}
        
        {!video.video_url && video.status !== 'completed' && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-500">
              {video.status === 'processing' ? 'Video is still processing...' : 
               video.status === 'failed' ? 'Video generation failed' : 
               'Video is pending processing'}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 text-xs text-gray-600 flex justify-between">
        <div>
          ID: {video.generation_id.slice(0, 8)}...
        </div>
        <div>
          {video.duration && `Duration: ${video.duration}`}
          {video.processing_time && ` | Processed in: ${Math.round(video.processing_time)}s`}
        </div>
      </CardFooter>
    </Card>
  );
} 