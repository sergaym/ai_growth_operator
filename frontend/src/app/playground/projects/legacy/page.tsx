"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";

export default function LegacyProjectsPage() {
  return (
    <PlaygroundLayout
      title="Legacy Projects"
      description="Access and manage your legacy project features."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legacy Projects List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Legacy Projects</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Classic Campaign</h3>
                  <p className="text-sm text-zinc-400">Last edited 1 month ago</p>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                  Legacy
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:bg-white/[0.1] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Old Product Demo</h3>
                  <p className="text-sm text-zinc-400">Last edited 2 months ago</p>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                  Legacy
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Legacy Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Legacy Features</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10">
              <h3 className="font-medium mb-2">Classic Editor</h3>
              <p className="text-sm text-zinc-400">Access the original video editor interface</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10">
              <h3 className="font-medium mb-2">Old Templates</h3>
              <p className="text-sm text-zinc-400">Browse and use legacy project templates</p>
            </div>
          </div>
        </Card>

        {/* Migration Guide */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Migration Guide</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-sm text-zinc-400">Review your legacy projects and identify which ones to migrate</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-zinc-400">Use the migration tool to convert projects to the new format</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-zinc-400">Verify all content and settings after migration</p>
            </div>
          </div>
        </Card>
      </div>
    </PlaygroundLayout>
  );
} 