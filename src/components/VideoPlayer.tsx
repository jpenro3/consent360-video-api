'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    specialty: string;
    format?: string;
    resolution?: string;
    fileSize?: number;
  };
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setLoading(false);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = () => {
      setLoading(false);
      setError('Failed to load video. Please try again.');
    };

    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          onClose();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onClose, toggleFullscreen, togglePlay]); // Added all dependencies

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl mx-4 bg-black rounded-lg overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
        >
          ✕
        </button>

        {/* Video Element */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading video...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <p className="text-lg mb-2">Video Loading Error</p>
                <p className="text-sm text-gray-400">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    videoRef.current?.load();
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-auto max-h-[70vh]"
            poster={video.thumbnailUrl}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info */}
        <div className="p-4 bg-gray-900 text-white">
          <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
          <p className="text-gray-300 text-sm mb-4">{video.description}</p>
          
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 mb-4">
            <div>
              <span className="block text-gray-500">Specialty</span>
              <span className="capitalize">{video.specialty}</span>
            </div>
            {video.format && (
              <div>
                <span className="block text-gray-500">Format</span>
                <span className="uppercase">{video.format}</span>
              </div>
            )}
            {video.resolution && (
              <div>
                <span className="block text-gray-500">Resolution</span>
                <span>{video.resolution}</span>
              </div>
            )}
            {video.fileSize && (
              <div>
                <span className="block text-gray-500">File Size</span>
                <span>{formatFileSize(video.fileSize)}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              <span className="text-sm tabular-nums">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  disabled={loading || !!error}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white p-2 hover:bg-gray-700 rounded"
                >
                  {isFullscreen ? '🗗' : '⛶'}
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="text-xs text-gray-500 text-center">
              <span>Space: Play/Pause | F: Fullscreen | Esc: Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
