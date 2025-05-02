"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, Key, RefreshCcw, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function PublicAPISettings() {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys that allow external applications to access your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="api-access">Enable API Access</Label>
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

          <Separator />
          
          <div className={cn("space-y-4", !apiKeyEnabled && "opacity-50 pointer-events-none")}>
            <div className="flex items-start gap-2">
              <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Secret API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use this key to authenticate API requests. Keep it secure and don't share it publicly.
                </p>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
            
            <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-md">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">API Security</h3>
                <p className="text-sm text-muted-foreground">
                  For security reasons, we don't display your full API key. Regenerate your key if you suspect it has been compromised.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 