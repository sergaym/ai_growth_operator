"use client";
import React, { useState, createElement, useEffect, useRef, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlaygroundLayout from "@/components/playground/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Search, MoreHorizontal, PlusCircle } from "lucide-react";
import { useWorkspaces, type Workspace } from "@/hooks/useWorkspace";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nanoid } from 'nanoid';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/services/apiClient';

// Simulated project data
const projectsData = [
  {
    id: nanoid(10),
    name: "Marketing Video",
    description: "Brand awareness campaign",
    lastEdited: "2 days ago",
    status: "completed",
    thumbnail: "/projects/marketing-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Product Showcase",
    description: "New feature demonstration",
    lastEdited: "5 hours ago",
    status: "in-progress",
    thumbnail: "/projects/product-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Team Introduction",
    description: "Company culture video",
    lastEdited: "1 week ago",
    status: "completed",
    thumbnail: "/projects/team-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Tutorial Series",
    description: "How-to guides for new users",
    lastEdited: "3 days ago",
    status: "draft",
    thumbnail: "/projects/tutorial-thumbnail.jpg",
  },
  {
    id: nanoid(10),
    name: "Customer Testimonial",
    description: "Success story interview",
    lastEdited: "Just now",
    status: "in-progress",
    thumbnail: "/projects/testimonial-thumbnail.jpg",
  },
];

// Skeleton loader component for workspace cards
function WorkspaceSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-200">
      <CardContent className="p-0">
        <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/60 to-transparent animate-shimmer-slow" style={{ backgroundSize: '200% 100%' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to handle payment redirects and search params
function PaymentHandler() {
  const { refetchWorkspaces } = useWorkspaces();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHandledRedirect = useRef(false);

  useEffect(() => {
    const stripeSessionId = searchParams.get('stripe_session_id');
    const paymentStatus = searchParams.get('payment');

    // Handle success case (redirected from Stripe)
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your subscription is now active.');
      refetchWorkspaces();
      return;
    }

    // Handle legacy Stripe webhook verification if needed
    const handleStripeRedirect = async () => {
      if (hasHandledRedirect.current || !stripeSessionId) return;
      hasHandledRedirect.current = true;

      try {
        const session = await apiClient<{ session_id: string; status: string; payment_status: string; customer_email?: string | null }>(
          `/api/v1/subscriptions/stripe/checkout-session/${stripeSessionId}`
        );

        if (session.status === 'complete') {
          if (session.payment_status === 'paid') {
            toast.success('Payment successful! Your subscription is now active.');
          } else if (session.payment_status === 'no_payment_required') {
            toast.info('Your subscription is now active.');
          } else {
            toast.error('Payment was processed, but the subscription could not be activated immediately. Please contact support.');
          }
          await refetchWorkspaces();
        } else if (session.status === 'open') {
          toast.info('Your payment is still processing. We will notify you once completed.');
        } else {
          toast.warning('Your payment is still being processed. Please check back later.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('There was an error verifying your payment. Please contact support if the issue persists.');
      }
    };

    if (stripeSessionId) {
      handleStripeRedirect();
    } else if (searchParams.get('stripe_payment_status') === 'cancelled') {
      toast.info('Payment was cancelled. You can try again if you change your mind.');
    }
  }, [searchParams, router, refetchWorkspaces]);

  return null; // This component doesn't render anything
}

function PlaygroundOverviewContent() {
  const { workspaces, loading, error } = useWorkspaces();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter workspaces based on search query
  const filteredWorkspaces = searchQuery && workspaces
    ? workspaces.filter((workspace: Workspace) => 
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workspaces;

  const handleNewWorkspace = () => {
    alert('Create new workspace - to be implemented');
  };

  return (
    <PlaygroundLayout
      title="Workspaces"
      description="Select a workspace or create a new one to get started."
      currentWorkspace={{ id: '', name: 'Select a workspace' }}
    >
      {loading && (
        <div className="fixed top-0 left-0 w-full h-0.5 z-50">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-shimmer"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search workspaces..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1" onClick={handleNewWorkspace}>
            <PlusCircle className="h-4 w-4" />
            <span>New Workspace</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <p className="font-medium text-sm">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, index) => (
            <WorkspaceSkeleton key={`skeleton-${index}`} />
          ))
        ) : filteredWorkspaces && filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspace: Workspace) => (
            <Card key={workspace.id} className="overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-0">
                <a href={`/playground/${workspace.id}`} className="block">
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                        <span className="text-2xl font-bold text-indigo-500">
                          {workspace.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{workspace.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Type: {workspace.type || 'Default'}</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
            <div className="mb-4">
              <FolderPlus className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No workspaces found</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first workspace to get started.</p>
            <Button className="mt-4" onClick={handleNewWorkspace}>
              Create Workspace
            </Button>
          </div>
        )}
      </div>
    </PlaygroundLayout>
  );
}

export default function PlaygroundOverview() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentHandler />
      <PlaygroundOverviewContent />
    </Suspense>
  );
}