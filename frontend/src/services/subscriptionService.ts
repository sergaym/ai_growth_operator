import { apiClient } from './apiClient';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_interval: string;
  max_users: number;
  created_at: string;
  updated_at: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

export interface Subscription {
  id: number;
  workspace_id: number;
  plan_id: number;
  status: string;
  stripe_subscription_id?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
  metadata_json?: Record<string, any>;
  plan?: SubscriptionPlan;
}

export interface Workspace {
  id: number;
  name: string;
  type: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  active_subscription?: Subscription;
}

interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

interface CustomerPortal {
  portal_url: string;
}

export const subscriptionService = {
  /**
   * Get all available subscription plans
   */
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    return await apiClient<SubscriptionPlan[]>('/api/v1/subscriptions/plans', {
      method: 'GET'
    });
  },

  /**
   * Get workspace details with active subscription
   */
  getWorkspaceWithSubscription: async (workspaceId: string | number): Promise<Workspace> => {
    console.log(`Fetching workspace with subscription for workspace ID: ${workspaceId}`);
    return await apiClient<Workspace>(`/api/v1/workspaces/${workspaceId}`, {
      method: 'GET'
    });
  },

  /**
   * Get active subscription for a workspace
   */
  getWorkspaceSubscription: async (workspaceId: string | number): Promise<Subscription> => {
    console.log(`Fetching subscription for workspace ID: ${workspaceId}`);
    return await apiClient<Subscription>(`/api/v1/subscriptions/workspaces/${workspaceId}/subscription`, {
      method: 'GET'
    });
  },

  /**
   * Create checkout session for a new subscription
   */
  createCheckoutSession: async (workspaceId: string | number, planId: number): Promise<CheckoutSession> => {
    return await apiClient<CheckoutSession>(`/api/v1/subscriptions/workspaces/${workspaceId}/checkout?plan_id=${planId}`, {
      method: 'POST'
    });
  },

  /**
   * Create Stripe customer portal session for managing subscription
   */
  createCustomerPortalSession: async (workspaceId: string | number): Promise<CustomerPortal> => {
    return await apiClient<CustomerPortal>(`/api/v1/subscriptions/workspaces/${workspaceId}/portal`, {
      method: 'POST'
    });
  }
};
