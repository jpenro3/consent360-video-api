export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Consent360 Video Admin
            </h1>
            <p className="text-gray-600 mb-8">
              API endpoints for managing videos and partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">V</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Videos API
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        /api/videos/published
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Get published videos with API key authentication
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Partners API
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        /api/partners
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Get partner information with API key authentication
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Test API
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        /api/test
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Test DynamoDB connectivity and environment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                API Usage
              </h3>
              <div className="prose prose-sm text-gray-500">
                <p><strong>Authentication:</strong> Include <code>x-api-key</code> header with valid API key</p>
                <p><strong>Videos:</strong> <code>GET /api/videos/published?limit=10&offset=0</code></p>
                <p><strong>Partners:</strong> <code>GET /api/partners</code></p>
                <p><strong>Test:</strong> <code>GET /api/test</code> (no authentication required)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
