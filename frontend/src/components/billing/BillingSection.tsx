"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  RefreshCw, 
  Users, 
  Calendar, 
  ArrowRight, 
  Shield, 
  Loader2,
  CheckCircle
} from 'lucide-react';
import { subscriptionService, Subscription, SubscriptionPlan } from '@/services/subscriptionService';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface BillingSectionProps {
  workspaceId: string | number;
  onSuccess?: () => void;
}

export function BillingSection({ workspaceId, onSuccess }: BillingSectionProps) {
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // Fetch the workspace's active subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        
        // Ensure workspaceId is a number for API calls
        const numericWorkspaceId = typeof workspaceId === 'string' ? parseInt(workspaceId) : workspaceId;
        
        // First try to get the subscription from the workspace
        const workspace = await subscriptionService.getWorkspaceWithSubscription(numericWorkspaceId);
        
        if (workspace.active_subscription) {
          setSubscription(workspace.active_subscription);
        } else {
          // If not found in workspace, try the direct subscription endpoint
          try {
            const sub = await subscriptionService.getWorkspaceSubscription(numericWorkspaceId);
            setSubscription(sub);
          } catch (err) {
            // Subscription not found is okay - the workspace might not have one yet
            console.log('No active subscription found for this workspace');
          }
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription details. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchSubscription();
    }
  }, [workspaceId, toast]);

  // Handle redirecting to Stripe customer portal
  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      // Ensure workspaceId is a number for API calls
      const numericWorkspaceId = typeof workspaceId === 'string' ? parseInt(workspaceId) : workspaceId;
      const portal = await subscriptionService.createCustomerPortalSession(numericWorkspaceId);
      window.location.href = portal.portal_url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again later.',
        variant: 'destructive'
      });
      setPortalLoading(false);
    }
  };

  // Get plan tier for styling
  const getPlanTier = (plan?: SubscriptionPlan) => {
    if (!plan) return 'starter';
    return plan.price < 50 ? 'starter' : plan.price < 100 ? 'professional' : 'enterprise';
  };

  // Format subscription dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-500';
      case 'past_due':
      case 'unpaid':
        return 'text-yellow-500';
      case 'canceled':
      case 'expired':
        return 'text-red-500';
      case 'trialing':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  // Check if the subscription is active
  const isSubscriptionActive = subscription?.status?.toLowerCase() === 'active';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-400">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">        
        <div className="flex items-center gap-3">
          {subscription && (
            <Button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Current Plan */}
      {subscription ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg p-6"
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{subscription.plan?.name || 'Current Plan'}</h3>
                <span className={`text-sm px-2 py-0.5 rounded-full ${getStatusColor(subscription.status)} bg-opacity-20`}>
                  {subscription.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Up to {subscription.plan?.max_users || 'N/A'} users</span>
                </div>
                
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Renewal date: {formatDate(subscription.end_date)}</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-500">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <span>Billing: each {subscription.plan?.billing_interval || 'month'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <span className="text-3xl font-bold">
                  {subscription.plan?.price 
                    ? `${subscription.plan.currency === 'eur' ? '€' : '$'}${subscription.plan.price}`
                    : 'N/A'}
                </span>
                <span className="text-zinc-400 ml-1">/{subscription.plan?.billing_interval || 'month'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center"
        >
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
            <p className="text-zinc-400 max-w-lg mb-6">
              Your workspace doesn't have an active subscription plan. Choose a plan to unlock all features and increase your team size.
            </p>
            <Button
              onClick={() => window.location.href = `/pricing?workspace=${typeof workspaceId === 'string' ? workspaceId : workspaceId.toString()}`}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              View Plans <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Benefits */}
      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg p-5"
          >
            <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
            <h4 className="text-lg font-semibold mb-2">Priority Support</h4>
            <p className="text-zinc-400">Get faster response times and dedicated support.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg p-5"
          >
            <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
            <h4 className="text-lg font-semibold mb-2">Team Collaboration</h4>
            <p className="text-zinc-400">Add team members and collaborate on projects.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg p-5"
          >
            <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
            <h4 className="text-lg font-semibold mb-2">Advanced Features</h4>
            <p className="text-zinc-400">Access to premium AI features and analytics tools.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
