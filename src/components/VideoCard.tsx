'use client';

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
  };
}

export default function VideoCard({ video }: VideoCardProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-2">🎥</div>
          <div className="text-sm opacity-90">{formatDuration(video.duration)}</div>
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

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center">
              {getSpecialtyIcon(video.specialty)}
              <span className="ml-1 capitalize">{video.specialty}</span>
            </span>
            <span>📅 {formatDate(video.createdAt)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>🆔 {video.id}</span>
            <span>⏱️ {formatDuration(video.duration)}</span>
          </div>
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
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            📺 Preview
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
            📋 Details
          </button>
        </div>
      </div>
    </div>
  );
}
