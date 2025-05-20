"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, Key, RefreshCcw, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface PublicAPISettingsProps {
  workspaceId?: string;
}

export function PublicAPISettings({ workspaceId }: PublicAPISettingsProps) {
  const [apiKeyEnabled, setApiKeyEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('sk_live_34SikJFAJi29FAJSFikafj392fji392');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    });
  };

  const handleGenerateNewApiKey = () => {
    // In a real implementation, you would make an API call to generate a new key
    setApiKey('sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    toast({
      title: "New API key generated",
      description: "Your new API key has been generated. Make sure to update any applications using the old key.",
      duration: 5000,
    });
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 7);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'•'.repeat(Math.max(0, key.length - 11))}${suffix}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">API Keys</h3>
        <p className="text-muted-foreground">
          Manage API keys that allow external applications to access your workspace.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="api-access" className="text-base">Enable API Access</Label>
            <p className="text-sm text-muted-foreground">
              Allow external applications to access your workspace via API.
            </p>
          </div>
          <Switch
            id="api-access"
            checked={apiKeyEnabled}
            onCheckedChange={setApiKeyEnabled}
          />
        </div>

        <Separator className="my-6" />
        
        <div className={cn("space-y-6", !apiKeyEnabled && "opacity-50 pointer-events-none")}>
          <div className="flex items-start space-x-3">
            <Key className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Secret API Key</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use this key to authenticate API requests. Keep it secure and don't share it publicly.
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                  <Input
                    value={showApiKey ? apiKey : maskApiKey(apiKey)}
                    readOnly
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleApiKeyVisibility}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button size="icon" variant="outline" onClick={handleCopyApiKey}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleGenerateNewApiKey}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-start mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-md">
            <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0 mr-3" />
            <div>
              <h4 className="font-medium mb-1 text-sm">API Security</h4>
              <p className="text-sm text-muted-foreground">
                For security reasons, we don't display your full API key. Regenerate your key if you suspect it has been compromised.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium mb-3">Usage Guidelines</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Include the API key in the authorization header of your requests.</li>
              <li>Rate limits are set to 60 requests per minute by default.</li>
              <li>Contact support if you need higher rate limits.</li>
              <li>Review our <a href="#" className="text-primary underline">API documentation</a> for detailed instructions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 