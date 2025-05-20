"use client";

import { useParams } from "next/navigation";
import PlaygroundLayout from "@/components/playground/Layout";

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const stringWorkspaceId = workspaceId as string || '';

  return (
    <PlaygroundLayout
      title="Project Details"
      currentWorkspace={{ id: stringWorkspaceId, name: "Project Workspace" }}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Details</h1>
        <p>Workspace ID: {stringWorkspaceId}</p>
        <p>Project ID: {projectId}</p>
      </div>
    </PlaygroundLayout>
  );
}
