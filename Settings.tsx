import React from 'react';
import { Settings as SettingsIcon, RefreshCcw } from 'lucide-react';
import { useSettings } from '../store/settings';
import type { LLMProvider } from '../types';

const providers: { id: LLMProvider; name: string }[] = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'gpt', name: 'OpenAI GPT' }
];

export function Settings() {
  const {
    selectedProvider,
    apiKeys,
    playerColor,
    setProvider,
    setApiKey,
    setPlayerColor
  } = useSettings();

  return (
    <div className="bg-gray-800 p-6 rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Game Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select LLM Provider</label>
          <select
            className="w-full bg-gray-700 rounded-lg p-2 text-white"
            value={selectedProvider || ''}
            onChange={(e) => setProvider(e.target.value as LLMProvider)}
          >
            <option value="">Select Provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProvider && (
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              className="w-full bg-gray-700 rounded-lg p-2 text-white"
              value={apiKeys[selectedProvider]}
              onChange={(e) => setApiKey(selectedProvider, e.target.value)}
              placeholder={`Enter ${selectedProvider === 'gemini' ? 'Google' : 'OpenAI'} API Key`}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Play as</label>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                playerColor === 'w'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 text-white'
              }`}
              onClick={() => setPlayerColor('w')}
            >
              White
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                playerColor === 'b'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 text-white'
              }`}
              onClick={() => setPlayerColor('b')}
            >
              Black
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="w-4 h-4" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}