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

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-sm text-zinc-400">Start with a clear script and storyboard for best results</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-zinc-400">Use high-quality voice recordings for better lip sync</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-zinc-400">Preview your video before finalizing to ensure quality</p>
            </div>
          </div>
        </Card>
      </div>
    </PlaygroundLayout>
  );
} 