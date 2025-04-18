import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";

interface AvatarCreationFormProps {
  onCreateAvatar?: (data: AvatarTrainingData) => Promise<any>;
  isCreating?: boolean;
}

export interface AvatarTrainingData {
  name: string;
  description: string;
  gender: string;
  photoFiles: File[];
}

export default function AvatarCreationForm({ onCreateAvatar, isCreating = false }: AvatarCreationFormProps) {
  const [formData, setFormData] = useState<AvatarTrainingData>({
    name: '',
    description: '',
    gender: 'female',
    photoFiles: [],
  });
  
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle form field changes
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUploadError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };
  
  // Validate and add files
  const validateAndAddFiles = (files: File[]) => {
    // Filter for only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setUploadError('Please upload valid image files');
      return;
    }
    
    // Limit to 10 files max
    if (formData.photoFiles.length + imageFiles.length > 10) {
      setUploadError('Maximum 10 photos allowed for avatar training');
      return;
    }
    
    // Create preview URLs
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    
    // Update state
    setFormData(prev => ({
      ...prev,
      photoFiles: [...prev.photoFiles, ...imageFiles]
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Trigger the file input click
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.photoFiles.length < 3) {
      setUploadError('Please upload at least 3 photos for best results');
      return;
    }
    
    if (!formData.name.trim()) {
      setUploadError('Please enter a name for your avatar');
      return;
    }
    
    try {
      if (onCreateAvatar) {
        await onCreateAvatar(formData);
      }
      
      // Clear form after successful submission
      setFormData({
        name: '',
        description: '',
        gender: 'female',
        photoFiles: []
      });
      
      // Clear previews
      previewImages.forEach(url => URL.revokeObjectURL(url));
      setPreviewImages([]);
      
    } catch (error) {
      console.error('Failed to create avatar:', error);
      setUploadError('Failed to create avatar. Please try again.');
    }
  };
  
  return (
    <Card className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#e6e6e6]">
        <h2 className="text-lg font-medium text-[#37352f]">Create New Avatar</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-end">
            <Button 
              type="submit" 
              disabled={isCreating || formData.photoFiles.length === 0}
              className="bg-[#2d3748] hover:bg-[#1a202c] text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Train Avatar"
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#37352f] font-medium text-sm">Avatar Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Give your avatar a name"
                  className="bg-white border-[#e6e6e6] rounded-md focus-visible:ring-[#e1e1e1] focus-visible:border-[#d1d1d1]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#37352f] font-medium text-sm">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of your avatar"
                  className="h-20 bg-white border-[#e6e6e6] rounded-md focus-visible:ring-[#e1e1e1] focus-visible:border-[#d1d1d1]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#37352f] font-medium text-sm">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger 
                    id="gender"
                    className="w-full bg-white border-[#e6e6e6] rounded-md focus:ring-[#e1e1e1] focus:border-[#d1d1d1]"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#e6e6e6] rounded-md">
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="nonbinary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">
                  Upload 3-10 high-quality photos of the same person for best results. 
                  The person should be clearly visible and facing the camera.
                </p>
              </div>
            </div>
            
            {/* Right column - Photo upload */}
            <div>
              {/* Drag & Drop Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-4 h-[260px] flex flex-col items-center justify-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-[#e6e6e6] hover:border-gray-400 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={inputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
                
                {previewImages.length > 0 ? (
                  <div className="w-full h-full overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {previewImages.map((src, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={src}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={20} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add more button if less than 10 photos */}
                      {previewImages.length < 10 && (
                        <button
                          type="button"
                          onClick={onButtonClick}
                          className="w-full h-20 flex items-center justify-center bg-white border border-dashed border-[#e6e6e6] rounded-md hover:border-gray-400"
                        >
                          <ImageIcon size={24} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <h3 className="text-gray-700 font-medium mb-1">Drag photos here</h3>
                    <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onButtonClick}
                      className="border-[#e6e6e6]"
                    >
                      Select Photos
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Error message */}
              {uploadError && (
                <div className="mt-2 text-sm text-red-500">
                  {uploadError}
                </div>
              )}
              
              {/* Photo count */}
              <div className="mt-2 text-sm text-gray-500 flex justify-between items-center">
                <span>{formData.photoFiles.length} of 10 photos added</span>
                {previewImages.length > 0 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, photoFiles: [] }));
                      previewImages.forEach(url => URL.revokeObjectURL(url));
                      setPreviewImages([]);
                    }}
                    className="text-gray-500 hover:text-red-500 h-auto p-1"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
} 