"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { BillingSection } from '@/components/billing/BillingSection';

import PlaygroundLayout from '@/components/playground/Layout';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';

export default function WorkspaceBillingPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { workspaces } = useWorkspaceContext();
  const currentWorkspace = workspaces.find((ws: { id: string; name: string }) => ws.id === workspaceId) || { id: workspaceId, name: 'Workspace' };
  
  return (
    <PlaygroundLayout
      title="Billing"
      currentWorkspace={{
        id: workspaceId,
        name: currentWorkspace?.name || 'Workspace'
      }}
      description="Manage your subscription, payment methods, and billing history"
    >
      <div className="container py-4">
        <BillingSection workspaceId={workspaceId} />
      </div>
    </PlaygroundLayout>
  );
}
