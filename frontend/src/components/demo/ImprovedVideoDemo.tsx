import React, { useState } from 'react';
import { VideoPreview } from '@/components/chat/VideoPreview';
import { EnhancedGestureChat } from '@/components/chat/EnhancedGestureChat';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users } from 'lucide-react';

export function ImprovedVideoDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleGenerateVideo = async (text: string, actorId: string, actorVideoUrl: string, language: string) => {
    setError(undefined);
    setVideoUrl(undefined);
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('text_to_speech');

    try {
      // Simulate TTS step
      for (let i = 0; i <= 50; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCurrentStep('lipsync');
      
      // Simulate lipsync step
      for (let i = 50; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Success
      setVideoUrl('/demo-video.mp4'); // This would be a real video URL
      setIsGenerating(false);
      setCurrentStep(undefined);
      setProgress(100);
      
    } catch (err) {
      setError('Failed to generate video. Please try again.');
      setIsGenerating(false);
      setCurrentStep(undefined);
    }
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setCurrentStep(undefined);
    setProgress(0);
  };

  const handleReset = () => {
    setVideoUrl(undefined);
    setError(undefined);
    setProgress(0);
    setCurrentStep(undefined);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 mb-6">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-700">AI Video Platform Demo</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Improved Video Experience
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            See how we've enhanced the user experience with better guidance, 
            progress indicators, and engaging video presentation.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Better Onboarding</h3>
              <p className="text-sm text-slate-600">Clear guidance for first-time users with helpful tips and examples</p>
            </Card>
            
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Enhanced Progress</h3>
              <p className="text-sm text-slate-600">Beautiful progress indicators showing each step of video generation</p>
            </Card>
            
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Engaging Results</h3>
              <p className="text-sm text-slate-600">Interactive video player with smooth controls and sharing options</p>
            </Card>
          </div>
        </div>

        {/* Main Demo */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Video Preview */}
          <VideoPreview
            videoUrl={videoUrl}
            isGenerating={isGenerating}
            progress={progress}
            currentStep={currentStep}
            error={error}
            processingTime={videoUrl ? 127 : undefined}
            onCancel={handleCancel}
            onReset={handleReset}
            onRetry={handleReset}
            showGettingStarted={!videoUrl && !error && !isGenerating}
          />

          {/* Enhanced Chat */}
          <EnhancedGestureChat
            projectId="demo-project"
            onGenerateVideo={handleGenerateVideo}
            isGenerating={isGenerating}
            showTips={true}
          />
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16">
          <Badge variant="secondary" className="bg-white/80 text-slate-600">
            This is a demonstration of the improved UX patterns
          </Badge>
        </div>
      </div>
    </div>
  );
} 