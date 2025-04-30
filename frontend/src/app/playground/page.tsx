"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";

export default function Playground() {
  return (
    <PlaygroundLayout
      title="AI Video Studio"
      description="Create professional AI-powered videos in minutes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]">
              Create New Video
            </button>
            <button className="w-full py-4 px-6 border border-white/10 hover:bg-white/[0.1] text-white rounded-xl font-medium transition-all">
              Browse Templates
            </button>
          </div>
        </Card>

        {/* Recent Projects */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Campaign</h3>
                  <p className="text-sm text-zinc-400">Last edited 2 hours ago</p>
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Product Demo</h3>
                  <p className="text-sm text-zinc-400">Last edited 5 hours ago</p>
                </div>
                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">Total Videos</p>
              <p className="text-2xl font-semibold mt-1">24</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">Storage Used</p>
              <p className="text-2xl font-semibold mt-1">2.4 GB</p>
            </div>
          </div>
        </Card>

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