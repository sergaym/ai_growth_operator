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
