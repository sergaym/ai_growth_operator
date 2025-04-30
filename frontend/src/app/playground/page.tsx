"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";

export default function Playground() {
  return (
              </div>
              <div>
                <h3 className="font-medium text-[#37352f]">{avatar.avatar_name}</h3>
                <p className="text-sm text-gray-500">ID: {avatar.avatar_id}</p>
                <p className="text-sm text-gray-500">Gender: {avatar.gender}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to clear all saved videos from localStorage and state
  const handleClearVideos = () => {
    // Confirm before clearing all videos
    if (avatarVideos.length > 0 && window.confirm('Are you sure you want to clear all your saved videos? This action cannot be undone.')) {
      // Clear from localStorage
      localStorage.removeItem('avatarVideos');
      // Clear from state
      setAvatarVideos([]);
    }
  };

  return (
    <PlaygroundLayout
      title="Welcome to the Playground"
      description="This is where you'll create amazing AI-powered videos for your brand."
      error={apiError}
    >
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="video-generation">Video Generation</TabsTrigger>
          <TabsTrigger value="avatar-creation">Avatar Creation</TabsTrigger>
          <TabsTrigger value="my-videos">My Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="video-generation">
          <Card className="p-6">
            <CreateVideoSection
              avatars={avatars}
              voices={voices}
              loadingAvatars={loadingAvatars}
              loadingVoices={loadingVoices}
              avatarsError={avatarsError}
              voicesError={voicesError}
              isGenerating={isGenerating}
              onVideoGenerated={handleAvatarVideoGenerated}
              onCreateAvatar={handleAvatarCreation}
              onRetryApiLoad={handleRetryApiLoad}
            />
          </Card>
        </TabsContent>

        <TabsContent value="avatar-creation">
          <Card className="p-6">
            <AvatarCreationForm
              onCreateAvatar={handleAvatarCreation}
              isCreating={isCreatingAvatar}
            />
            {avatarCreationError && (
              <div className="mt-4 p-4 bg-[#ffebe8] border border-[#ffc1ba] rounded-md text-[#e03e21]">
                <p className="font-medium">Error: {avatarCreationError}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="my-videos">
          <VideoList
            title="Your Videos"
            count={avatarVideos.length}
            noItemsMessage="No videos created yet. Get started by creating your first video above."
            renderItems={renderLocalVideos}
            actionButton={
              avatarVideos.length > 0 ? {
                label: "Clear All Videos",
                onClick: handleClearVideos,
                variant: "danger"
              } : undefined
            }
          />
          
          <div className="mt-8">
            <VideoList
              title="All Database Videos"
              count={databaseVideos.length}
              loading={loadingDatabaseVideos}
              error={databaseVideosError}
              noItemsMessage="No videos found in the database."
              onRefresh={refetchDatabaseVideos}
              onRetry={refetchDatabaseVideos}
              showRefreshButton={true}
              renderItems={renderDatabaseVideos}
            />
          </div>
        </TabsContent>
      </Tabs>

      <NextStepsGuide />
    </PlaygroundLayout>
  );
} 