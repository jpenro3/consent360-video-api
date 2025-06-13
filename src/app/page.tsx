export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Consent360 Video Admin API
            </h1>
            <p className="text-gray-600 mb-8">
              Clean, simple API for videos and partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Videos API</h3>
                <p className="text-sm text-gray-500">/api/videos/published</p>
                <p className="text-sm text-gray-600 mt-2">
                  Get published videos with API key authentication
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Partners API</h3>
                <p className="text-sm text-gray-500">/api/partners</p>
                <p className="text-sm text-gray-600 mt-2">
                  Get partner information with API key authentication
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Test API</h3>
                <p className="text-sm text-gray-500">/api/test</p>
                <p className="text-sm text-gray-600 mt-2">
                  Simple test endpoint to verify deployment
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Usage Example</h3>
                <div className="bg-gray-100 rounded-md p-4 mt-2">
                  <code className="text-sm text-gray-800">
                    curl -H &quot;x-api-key: your-key&quot; /api/videos/published
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}