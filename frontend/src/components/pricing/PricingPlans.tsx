"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionService, SubscriptionPlan, Subscription } from '@/services/subscriptionService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces, Workspace } from '@/hooks/useWorkspace';

// Format price display with robust floating-point comparison
const formatPrice = (price: number, currency: string) => {
  if (price == 0) return 'Free';
  if (price == -1) return 'Let\'s talk';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Helper function to determine if a plan is a lower tier than the current subscription
const isLowerTierPlan = (plan: SubscriptionPlan, currentSubscription: Subscription | null): boolean => {
  if (!currentSubscription?.plan) return false;
  const currentPlan = currentSubscription.plan;
  if (currentPlan.price === -1) return plan.price < currentPlan.price;
  if (plan.price === -1) return false;
  return plan.price < currentPlan.price;
};

// Get features from plan description or use default features if empty
const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
  const userCapacity = plan.max_users < 1 
    ? 'Custom users capacity'
    : plan.max_users === 1 
      ? 'Single user' 
      : `Up to ${plan.max_users} users`;
  
  let otherFeatures: string[] = [];
  
  if (plan.description) {
    otherFeatures = plan.description.split('\n').filter(feature => feature.trim() !== '');
  }
  
  return [userCapacity, ...otherFeatures];
};

interface PricingPlansProps {
  onSuccess?: () => void;
}

export function PricingPlans({
  onSuccess
}: PricingPlansProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true); // For current subscription
  const [plansLoading, setPlansLoading] = useState(true); // New state for plans loading

  // Workspace management using useWorkspaces hook
  const { workspaces: fetchedUserWorkspaces, loading: workspacesLoading, error: workspacesError } = useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null); // Changed to string | null
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [isWorkspaceSelectionRequired, setIsWorkspaceSelectionRequired] = useState(false);
  const [workspaceAccessError, setWorkspaceAccessError] = useState<string | null>(null);

  useEffect(() => {
    const planIdFromQuery = searchParams.get('planId');
    if (planIdFromQuery && !user.isAuthenticated && !authLoading) {
      // If redirected from signup with a planId, and now authenticated, proceed with that plan
      // This logic might need refinement based on exact flow after signup completion
    }
  }, [searchParams, user.isAuthenticated, authLoading]);

  // Effect to determine selectedWorkspaceId for authenticated users
  useEffect(() => {
    if (authLoading || !user.isAuthenticated) {
      setSelectedWorkspaceId(null);
      setIsWorkspaceSelectionRequired(false);
      setUserWorkspaces([]);
      setWorkspaceAccessError(null);
      return;
    }

    const workspaceIdFromQuery = searchParams.get('workspaceID');

    if (!workspaceIdFromQuery) {
        setWorkspaceAccessError(null);
    }

    if (workspaceIdFromQuery) {
      const isValidQueryId = fetchedUserWorkspaces.some(ws => ws.id == workspaceIdFromQuery);
      if (isValidQueryId) {
        setSelectedWorkspaceId(workspaceIdFromQuery);
        setWorkspaceAccessError(null);
      } else if (!workspacesLoading) {
        setWorkspaceAccessError("The workspace ID provided in the URL either does not exist or you do not have access to it.");
        setSelectedWorkspaceId(null);
      }
      setIsWorkspaceSelectionRequired(false);
    } else if (!workspacesLoading) {
      setUserWorkspaces(fetchedUserWorkspaces);
      if (fetchedUserWorkspaces.length === 1) {
        setSelectedWorkspaceId(fetchedUserWorkspaces[0].id);
        setIsWorkspaceSelectionRequired(false);
      } else if (fetchedUserWorkspaces.length > 1) {
        setSelectedWorkspaceId(null);
        setIsWorkspaceSelectionRequired(true);
      } else { // 0 workspaces
        setSelectedWorkspaceId(null);
        setIsWorkspaceSelectionRequired(false);
      }
    }
  }, [user.isAuthenticated, authLoading, searchParams, fetchedUserWorkspaces, workspacesLoading, toast]);

  // Effect to fetch subscription plans
  useEffect(() => {
    if (authLoading) { // Wait for auth state to resolve before fetching plans
      setPlansLoading(true);
      return;
    }

    setPlansLoading(true);
    subscriptionService.getSubscriptionPlans()
      .then(data => {
        const sortedData = [...data].sort((a, b) => {
          if (a.price == -1) return 1;
          if (b.price == -1) return -1;
          return a.price - b.price;
        });
        setAllPlans(sortedData);
      })
      .catch(error => {
        console.error('Error fetching subscription plans:', error);
        toast({ title: 'Error Loading Plans', description: 'Could not load pricing plans. Please try again later.', variant: 'destructive' });
        setAllPlans([]); // Ensure plans are empty on error
      })
      .finally(() => {
        setPlansLoading(false);
      });
  }, [authLoading, toast]);

  // Effect to fetch current subscription for the selected workspace
  useEffect(() => {
    if (authLoading || !user.isAuthenticated || !selectedWorkspaceId) {
      setCurrentSubscription(null); // Clear subscription if not applicable
      setSubscriptionLoading(false); // Not loading if conditions aren't met
      setWorkspaceAccessError(null); // Reset error
      return;
    }

    setSubscriptionLoading(true);
    setWorkspaceAccessError(null); // Reset error before new fetch
    subscriptionService.getWorkspaceSubscription(selectedWorkspaceId)
      .then(currentSub => {
        setCurrentSubscription(currentSub);
        setWorkspaceAccessError(null); // Clear any previous error on success
      })
      .catch(subError => {
        console.warn('Error fetching current subscription:', subError);
        setCurrentSubscription(null);
        setWorkspaceAccessError(null);
      })
      .finally(() => {
        setSubscriptionLoading(false);
      });
  }, [authLoading, user.isAuthenticated, selectedWorkspaceId, toast]);

  // Determine the effective current plan ID
  let effectiveCurrentPlanId: number | undefined | null = currentSubscription?.plan_id; // Changed to use plan_id directly
  if (
    user.isAuthenticated &&
    selectedWorkspaceId &&
    !currentSubscription && // No active subscription
    !subscriptionLoading // And we've finished trying to load it
  ) {
    const firstFreePlan = allPlans.find(p => p.price == 0);
    if (firstFreePlan) {
      effectiveCurrentPlanId = firstFreePlan.id;
    }
  }

  // Handle plan selection and redirect to Stripe checkout
  const handlePlanSelection = async (planId: number) => {
    if (authLoading || workspacesLoading) { // Use workspacesLoading from hook
      toast({
        title: "Please wait",
        description: "Loading user or workspace information.",
        variant: "default"
      });
      return;
    }

    if (!user.isAuthenticated) { 
      router.push(`/signup?planId=${planId}&callbackUrl=${encodeURIComponent(`/pricing?planId=${planId}`)}`);
      return;
    }

    if (!selectedWorkspaceId) {
      if (isWorkspaceSelectionRequired) {
        toast({
          title: 'Workspace Selection Required',
          description: 'Please select a workspace to continue.',
          variant: 'default'
        });
      } else if (fetchedUserWorkspaces.length === 0 && !workspacesLoading) { // Check if workspaces are loaded and empty
        toast({
          title: 'No Workspace Found',
          description: 'Please create a workspace first.', // Consider redirecting to workspace creation or showing a modal
          variant: 'default'
        });
      }
      return;
    }

    setCheckoutLoading(planId);
    try {
      const checkoutSession = await subscriptionService.createCheckoutSession(selectedWorkspaceId, planId);
      if (checkoutSession.checkout_url) {
        if (onSuccess) onSuccess();
        window.location.href = checkoutSession.checkout_url;
      } else {
        console.error('Error creating checkout session:', checkoutSession);
        toast({
          title: 'Error',
          description: 'Failed to create checkout session. Please try again later.',
          variant: 'destructive'
        });
        setCheckoutLoading(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again later.',
        variant: 'destructive'
      });
      setCheckoutLoading(null);
    }
  };

  // Initial loading states for auth and workspaces
  if (authLoading || workspacesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-6 text-lg text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  // Workspace selection UI if required
  if (isWorkspaceSelectionRequired && user.isAuthenticated) {
    return (
      <div className="py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 p-6 bg-background/70 backdrop-blur-md rounded-lg shadow-xl border border-border max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Select a Workspace</h3>
          <p className="text-muted-foreground mb-6">You have multiple workspaces. Please choose one to associate with your new plan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userWorkspaces.map((ws: Workspace) => (
              <Button 
                key={ws.id} 
                variant="outline"
                className="w-full justify-start text-left py-3 px-4 hover:bg-muted/50 transition-colors duration-150"
                onClick={() => {
                  setSelectedWorkspaceId(ws.id);
                  setIsWorkspaceSelectionRequired(false);
                  setWorkspaceAccessError(null);
                  toast({ title: `Workspace "${ws.name}" selected.`, description: "You can now choose a plan.", variant: "default" });
                }}
              >
                {ws.name || `Workspace ${ws.id}`}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state for plans or current subscription
  if (plansLoading || (user.isAuthenticated && selectedWorkspaceId && subscriptionLoading)) {
    return (
      <div className="py-12 md:py-20 text-center">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  const cameFromSignup = searchParams.get('from') === 'signup';

  return (
    <div className="py-12 md:py-20">
      {workspaceAccessError ? (
        <div className="my-8 text-center">
          <p className="text-red-500 text-lg font-semibold">Access Error</p>
          <p className="text-red-400 mt-2">{workspaceAccessError}</p>
        </div>
      ) : allPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {allPlans.map((plan, index) => {
            // Determine if this plan is the "popular" mid-tier plan
            const isPopular = index === 1 || (allPlans.length === 3 && plan.price > allPlans[0].price && plan.price < allPlans[2].price);
            // Get features for this plan
            const features = getPlanFeatures(plan);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/[0.02] backdrop-blur-sm rounded-2xl border ${
                  isPopular ? 'border-blue-500' : 'border-white/10'
                } p-8 flex flex-col`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-zinc-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-zinc-400">per {plan.billing_interval}</span>
                    )}
                  </div>
                  {plan.description && !plan.description.includes('\n') && (
                    <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className={i === 0 ? 'text-zinc-300 font-medium' : 'text-zinc-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.id == effectiveCurrentPlanId ? (
                  <div className="flex items-center justify-center w-full py-3 rounded-xl bg-zinc-700 text-white text-base font-medium min-h-[48px]">
                    Current plan
                  </div>
                ) : plan.price == -1 ? (
                  <a
                    href={`mailto:sales@example.com?subject=Custom Plan Inquiry - ${encodeURIComponent(plan.name)}&body=Hello! I'm interested in learning more about your ${encodeURIComponent(plan.name)} plan.`}
                    className={`flex items-center justify-center w-full py-3 rounded-xl transition-all text-base font-medium 
                      bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 
                      text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:translate-y-[-2px]
                      border border-teal-400/20 min-h-[48px]`}
                  >
                    Contact Us
                  </a>
                ) : isLowerTierPlan(plan, currentSubscription) ? (
                  <div className="flex items-center justify-center w-full py-3 rounded-xl bg-zinc-800/50 text-zinc-500 text-base font-medium min-h-[48px] border border-zinc-700">
                    Not Available
                  </div>
                ) : (
                  <Button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={checkoutLoading !== null || (user.isAuthenticated && (!selectedWorkspaceId && (isWorkspaceSelectionRequired || userWorkspaces.length === 0)))}
                    className={`w-full py-3 rounded-xl transition-all text-base font-medium min-h-[48px]
                      ${
                        checkoutLoading == plan.id
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white opacity-80'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-2px]'
                      }
                    `}
                  >
                    {checkoutLoading == plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.price == 0 ? 'Get Started for Free' : `Choose ${plan.name}`
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No pricing plans available at the moment.</p>
        </div>
      )}

      {cameFromSignup && !workspaceAccessError && (
        <div className="mt-12 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/playground')} // Navigate to playground
            className="text-zinc-300 hover:text-white hover:bg-transparent hover:underline cursor-pointer"
          >
            Skip for now &raquo;
          </Button>
        </div>
      )}
    </div>
  );
}