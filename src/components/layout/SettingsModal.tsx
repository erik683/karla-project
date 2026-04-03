import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAppStore } from '../../stores/useAppStore'
import { DataBackupSection } from './DataBackupSection'

export function SettingsModal() {
  const { isSettingsOpen, closeSettings, claudeApiKey, saveApiKey } = useSettingsStore()
  const { addToast } = useAppStore()
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (isSettingsOpen) setKeyInput(claudeApiKey)
  }, [isSettingsOpen, claudeApiKey])

  const handleSave = async () => {
    await saveApiKey(keyInput.trim())
    addToast('Settings saved')
    closeSettings()
  }

  return (
    <Modal isOpen={isSettingsOpen} onClose={closeSettings} title="Settings" size="md">
      <div className="space-y-6">
        {/* API Key */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Claude API Key</h3>
          <p className="text-xs text-gray-500 mb-3">
            Required for AI-powered features (Pattern Analysis, Brief generation). Your key is stored
            locally in your browser — it never leaves your device. Get a key at{' '}
            <span className="font-medium text-blue-600">console.anthropic.com</span>.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <DataBackupSection onToast={addToast} />

        {/* Save button */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={closeSettings}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  )
}
