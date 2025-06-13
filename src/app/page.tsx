'use client';

import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import VideoUpload from '../components/VideoUpload';

interface Video {
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
}

interface Partner {
  id: string;
  name: string;
  apiKey: string;
  status: string;
  createdAt: string;
  contactEmail: string;
  type: string;
}

interface ApiStatusData {
  environment?: {
    success: boolean;
    totalEnvCount: number;
  };
  credentials?: {
    success: boolean;
    environment: {
      isLambda: boolean;
      functionName?: string;
      hasAccessKey: boolean;
    };
    testResults: Array<{
      status: string;
    }>;
  };
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [apiKey, setApiKey] = useState('sk_test_123456');
  const [adminApiKey, setAdminApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'partners' | 'test'>('videos');
  const [apiStatus, setApiStatus] = useState<ApiStatusData | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  // Test API endpoint
  const testApi = async (endpoint: string, key: string) => {
    setLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'x-api-key': key
        }
      });
      
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
      
      if (endpoint === 'videos/published' && data.success) {
        setVideos(data.data);
      } else if (endpoint === 'partners' && data.success) {
        setPartners(data.data);
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check API status
  const checkApiStatus = async () => {
    try {
      const [envResponse, credResponse] = await Promise.all([
        fetch('/api/debug/env'),
        fetch('/api/test-credentials')
      ]);
      
      const [envData, credData] = await Promise.all([
        envResponse.json(),
        credResponse.json()
      ]);
      
      setApiStatus({
        environment: envData,
        credentials: credData
      });
    } catch (error) {
      console.error('Failed to check API status:', error);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎥 Consent360 Video API Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive interface for your video and partner management API
          </p>
          
          {/* API Status Indicator */}
          {apiStatus && (
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                apiStatus.credentials?.success ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium">
                API Status: {apiStatus.environment?.success ? 'Online' : 'Offline'} | 
                DynamoDB: {apiStatus.credentials?.environment?.isLambda ? 'Lambda' : 'Local'} | 
                Data: {apiStatus.credentials?.testResults?.[1]?.status === 'success' ? 'Live' : 'Mock'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 justify-center">
            {[
              { id: 'videos', label: '🎬 Videos', icon: '🎬' },
              { id: 'partners', label: '🤝 Partners', icon: '🤝' },
              { id: 'test', label: '🧪 API Tester', icon: '🧪' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'videos' | 'partners' | 'test')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* API Key Input & Upload Button */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">🔑 API Configuration</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your API key"
                  />
                </div>
                <button
                  onClick={() => testApi('videos/published', apiKey)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '⏳ Loading...' : '🔄 Fetch Videos'}
                </button>
                <VideoUpload 
                  apiKey={adminApiKey || apiKey} 
                  onUploadComplete={() => testApi('videos/published', apiKey)}
                />
              </div>
            </div>

            {/* Videos Grid */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    📺 Video Library ({videos.length} videos)
                  </h3>
                  <div className="text-sm text-gray-500">
                    {apiStatus?.credentials?.environment?.hasAccessKey ? '🔗 Live Data' : '🔄 Mock Data'}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            {/* Admin API Key Input */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">🔐 Admin Configuration</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin API Key
                  </label>
                  <input
                    type="text"
                    value={adminApiKey}
                    onChange={(e) => setAdminApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admin API key"
                  />
                </div>
                <button
                  onClick={() => testApi('partners', adminApiKey)}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? '⏳ Loading...' : '🔄 Fetch Partners'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: Admin API keys are configured separately from regular API keys
              </p>
            </div>

            {/* Partners List */}
            {partners.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          API Key
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                              <div className="text-sm text-gray-500">{partner.contactEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">
                              {partner.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              partner.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {partner.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {partner.apiKey.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(partner.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Tester Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            {/* Quick API Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { endpoint: 'debug/env', title: '🔍 Environment Check', description: 'Check environment variables', requiresAuth: false },
                { endpoint: 'test-credentials', title: '🔑 Credentials Test', description: 'Test AWS credentials', requiresAuth: false },
                { endpoint: 'debug/tables', title: '🗃️ Table Inspector', description: 'Inspect DynamoDB table data', requiresAuth: true, isAdmin: true },
                { endpoint: 'videos/published', title: '🎬 Videos API', description: 'Fetch published videos', requiresAuth: true },
                { endpoint: 'partners', title: '🤝 Partners API', description: 'Fetch partners (admin)', requiresAuth: true, isAdmin: true }
              ].map((test) => (
                <div key={test.endpoint} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-2">{test.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{test.description}</p>
                  <div className="space-y-2">
                    <code className="block text-xs bg-gray-100 p-2 rounded">
                      GET /api/{test.endpoint}
                    </code>
                    <button
                      onClick={() => testApi(test.endpoint, test.isAdmin ? adminApiKey : (test.requiresAuth ? apiKey : ''))}
                      disabled={loading}
                      className={`w-full px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 ${
                        test.isAdmin ? 'bg-purple-600' : test.requiresAuth ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {loading ? '⏳ Testing...' : `🧪 Test ${test.title}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* API Response */}
            {testResult && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">📋 API Response</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
