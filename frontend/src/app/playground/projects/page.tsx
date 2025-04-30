"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";

export default function ProjectsPage() {
  return (
    <PlaygroundLayout
      title="Projects"
      description="Manage and organize your projects in one place."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-2px]">
              Create New Project
            </button>
            <button className="w-full py-4 px-6 border border-white/10 hover:bg-white/[0.1] text-white rounded-xl font-medium transition-all">
              Import Project
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
                  Active
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Product Launch</h3>
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
              <p className="text-sm text-zinc-400">Total Projects</p>
              <p className="text-2xl font-semibold mt-1">12</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">Active Projects</p>
              <p className="text-2xl font-semibold mt-1">5</p>
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
              <p className="text-sm text-zinc-400">Organize your projects with clear naming conventions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-zinc-400">Use tags to categorize and filter your projects</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-zinc-400">Regularly update project status and documentation</p>
            </div>
          </div>
        </Card>
      </div>
    </PlaygroundLayout>
  );
} 