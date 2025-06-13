'use client';

import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    createdAt: string;
    status: string;
    specialty: string;
    tags: string[];
    format?: string;
    resolution?: string;
    fileSize?: number;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [imageError, setImageError] = useState(false);
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'surgery': return '🏥';
      case 'general': return '🩺';
      case 'cardiology': return '❤️';
      case 'neurology': return '🧠';
      case 'pediatrics': return '👶';
      case 'oncology': return '🎗️';
      default: return '📋';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
          {!imageError && video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-center text-white">
              <div className="text-4xl mb-2">🎥</div>
              <div className="text-sm opacity-90">{formatDuration(video.duration)}</div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <button
            onClick={() => setShowPlayer(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 group"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-4 group-hover:bg-opacity-30 transition-all">
              <div className="text-white text-2xl">▶️</div>
            </div>
          </button>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Status */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
              {video.title}
            </h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              video.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : video.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {video.status}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {video.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
            <div className="flex items-center">
              {getSpecialtyIcon(video.specialty)}
              <span className="ml-1 capitalize">{video.specialty}</span>
            </div>
            <div>📅 {formatDate(video.createdAt)}</div>
            
            {video.format && (
              <div>🎬 {video.format.toUpperCase()}</div>
            )}
            {video.resolution && (
              <div>📺 {video.resolution}</div>
            )}
            
            {video.fileSize && (
              <div>💾 {formatFileSize(video.fileSize)}</div>
            )}
            <div>🆔 {video.id}</div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{video.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPlayer(true)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              ▶️ Watch Now
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
              📋 Details
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && (
        <VideoPlayer
          video={video}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}
