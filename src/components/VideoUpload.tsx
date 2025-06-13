'use client';

import { useState } from 'react';

interface VideoUploadProps {
  apiKey: string;
  onUploadComplete: () => void;
}

export default function VideoUpload({ apiKey, onUploadComplete }: VideoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'form' | 'uploading' | 'complete'>('form');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialty: 'general',
    tags: '',
    file: null as File | null
  });

  const specialties = [
    'general',
    'surgery',
    'cardiology',
    'neurology',
    'pediatrics',
    'oncology',
    'emergency',
    'radiology'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a video file');
      return;
    }
    
    setUploading(true);
    setCurrentStep('uploading');
    
    try {
      // Step 1: Get upload URL
      setUploadProgress(10);
      const uploadUrlResponse = await fetch(
        `/api/videos/upload?fileName=${encodeURIComponent(formData.file.name)}&fileType=${encodeURIComponent(formData.file.type)}`,
        {
          headers: {
            'x-api-key': apiKey
          }
        }
      );
      
      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const uploadData = await uploadUrlResponse.json();
      setUploadProgress(20);
      
      // Step 2: Upload file to S3
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': formData.file.type
        },
        body: formData.file
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      setUploadProgress(70);
      
      // Step 3: Create video record
      const videoData = {
        title: formData.title,
        description: formData.description,
        specialty: formData.specialty,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        videoUrl: uploadData.videoUrl,
        fileSize: formData.file.size,
        format: formData.file.type.split('/')[1]
      };
      
      const recordResponse = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(videoData)
      });
      
      if (!recordResponse.ok) {
        throw new Error('Failed to create video record');
      }
      
      setUploadProgress(100);
      setCurrentStep('complete');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setCurrentStep('form');
        setUploadProgress(0);
        setFormData({
          title: '',
          description: '',
          specialty: 'general',
          tags: '',
          file: null
        });
        onUploadComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('form');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
      >
        📤 Upload Video
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📤 Upload New Video</h2>
          <button
            onClick={() => setIsOpen(false)}
            disabled={uploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {currentStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-file"
                />
                <label
                  htmlFor="video-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">🎥</div>
                  <div className="text-sm text-gray-600">
                    {formData.file ? formData.file.name : 'Click to select video file'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Supported: MP4, WebM, OGG (Max 100MB)
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video description"
                required
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Specialty
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
              />
              <div className="text-xs text-gray-500 mt-1">
                Example: consent, patient education, surgery
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!formData.file || !formData.title || !formData.description}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🚀 Upload Video
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {currentStep === 'uploading' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-xl font-semibold mb-4">Uploading Video...</h3>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            <div className="text-sm text-gray-600">
              {uploadProgress}% complete
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              {uploadProgress < 20 && 'Getting upload URL...'}
              {uploadProgress >= 20 && uploadProgress < 70 && 'Uploading to S3...'}
              {uploadProgress >= 70 && uploadProgress < 100 && 'Creating video record...'}
              {uploadProgress === 100 && 'Upload complete!'}
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your video has been uploaded and is ready for review.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting in 2 seconds...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
