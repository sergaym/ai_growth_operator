/**
 * Text to Image Demo Component
 * Demonstrates integration with the text-to-image API
 */

"use client";

import React, { useState } from 'react';
import { generateImage } from '@/services';
import type { GenerateImageRequest, ImageGenerationResponse } from '@/types/text-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function TextToImageDemo() {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [numInferenceSteps, setNumInferenceSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  
  // Request state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageGenerationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const request: GenerateImageRequest = {
        prompt,
        negative_prompt: negativePrompt || undefined,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        save_image: true,
      };
      
      const response = await generateImage(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text to Image Generation</CardTitle>
          <CardDescription>
            Generate stunning images from text descriptions using AI.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Text Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
              <Textarea
                id="negative-prompt"
                placeholder="Features to avoid in the image..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="inference-steps">Inference Steps: {numInferenceSteps}</Label>
              </div>
              <input
                id="inference-steps"
                type="range"
                min={20}
                max={100}
                step={1}
                value={numInferenceSteps}
                onChange={(e) => setNumInferenceSteps(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Higher values produce more detailed images but take longer.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="guidance-scale">Guidance Scale: {guidanceScale.toFixed(1)}</Label>
              </div>
              <input
                id="guidance-scale"
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Controls how closely the image matches your prompt.
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !prompt}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && result.blob_urls && result.blob_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
              <Image
                src={result.blob_urls[0]}
                alt={prompt}
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">Request ID: {result.request_id}</p>
            {result.blob_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2 w-full">
                {result.blob_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={url}
                      alt={`Variation ${i + 1}`}
                      fill
                      className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 