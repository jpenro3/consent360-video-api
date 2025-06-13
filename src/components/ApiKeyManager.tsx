'use client';

import { useState } from 'react';

interface ApiKeyManagerProps {
  onApiKeyChange: (key: string) => void;
  currentKey: string;
}

export default function ApiKeyManager({ onApiKeyChange, currentKey }: ApiKeyManagerProps) {
  const [showKeys, setShowKeys] = useState(false);
  const [customKey, setCustomKey] = useState('');

  const predefinedKeys = [
    'sk_test_123456',
    'partner-key-xyz', 
    'ak_zgeskc62jci'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">🔑 API Key Manager</h3>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showKeys ? '🙈 Hide Keys' : '👁️ Show Keys'}
        </button>
      </div>

      {/* Predefined Keys */}
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Quick Select (From Environment)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {predefinedKeys.map((key) => (
            <button
              key={key}
              onClick={() => onApiKeyChange(key)}
              className={`p-3 text-left border rounded-md hover:bg-gray-50 ${
                currentKey === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <code className="text-sm">
                  {showKeys ? key : `${key.substring(0, 8)}${'*'.repeat(key.length - 8)}`}
                </code>
                {currentKey === key && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Key Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Custom API Key
        </label>
        <div className="flex gap-2">
          <input
            type={showKeys ? 'text' : 'password'}
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom API key"
          />
          <button
            onClick={() => {
              if (customKey) {
                onApiKeyChange(customKey);
                setCustomKey('');
              }
            }}
            disabled={!customKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Use
          </button>
        </div>
      </div>

      {/* Current Key Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="text-xs text-gray-500 mb-1">Current API Key:</div>
        <code className="text-sm font-mono">
          {showKeys ? currentKey : `${currentKey.substring(0, 12)}${'*'.repeat(Math.max(0, currentKey.length - 12))}`}
        </code>
      </div>
    </div>
  );
}
