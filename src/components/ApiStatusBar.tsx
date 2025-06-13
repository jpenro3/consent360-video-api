'use client';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading';
  label: string;
  details?: string;
}

export function StatusIndicator({ status, label, details }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-red-400';
      case 'loading': return 'bg-yellow-400 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return '✅ Online';
      case 'offline': return '❌ Offline';
      case 'loading': return '⏳ Loading';
      default: return '❓ Unknown';
    }
  };

  return (
    <div className="inline-flex items-center px-3 py-2 bg-white rounded-lg shadow-sm border">
      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
      <span className="text-sm font-medium mr-2">{label}:</span>
      <span className="text-sm">{getStatusText()}</span>
      {details && (
        <span className="text-xs text-gray-500 ml-2">({details})</span>
      )}
    </div>
  );
}

interface ApiStatusBarProps {
  apiStatus: {
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
  } | null;
}

export default function ApiStatusBar({ apiStatus }: ApiStatusBarProps) {
  if (!apiStatus) {
    return (
      <div className="flex justify-center space-x-4 mb-6">
        <StatusIndicator status="loading" label="API Status" />
      </div>
    );
  }

  const envStatus = apiStatus.environment?.success ? 'online' : 'offline';
  const dbStatus = apiStatus.credentials?.testResults?.[1]?.status === 'success' ? 'online' : 'offline';
  const lambdaStatus = apiStatus.credentials?.environment?.isLambda ? 'online' : 'offline';

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <StatusIndicator 
        status={envStatus} 
        label="Environment" 
        details={`${apiStatus.environment?.totalEnvCount || 0} vars`}
      />
      <StatusIndicator 
        status={lambdaStatus} 
        label="Lambda" 
        details={apiStatus.credentials?.environment?.functionName ? 'Deployed' : 'Local'}
      />
      <StatusIndicator 
        status={dbStatus} 
        label="DynamoDB" 
        details={dbStatus === 'online' ? 'Connected' : 'Mock Data'}
      />
      <StatusIndicator 
        status={envStatus} 
        label="Credentials" 
        details={apiStatus.credentials?.environment?.hasAccessKey ? 'Available' : 'Mock Mode'}
      />
    </div>
  );
}
