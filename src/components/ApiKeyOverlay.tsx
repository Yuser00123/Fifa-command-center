/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Key, AlertCircle, HelpCircle, Eye, EyeOff, ShieldCheck, ArrowRight, Clipboard } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onKeySubmitted: (key: string) => void;
}

export default function ApiKeyOverlay({ onKeySubmitted }: Props) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setKeyInput(text.trim());
        setError(null);
      }
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
      setError('Pasting blocked by browser/iframe security. Please use Ctrl+V or Cmd+V to paste your key manually.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();

    if (!cleanKey) {
      setError('Please enter a valid Gemini API Key.');
      return;
    }

    const isValidPrefix = cleanKey.startsWith('AIzaSy') || cleanKey.startsWith('AQ');
    if (!isValidPrefix) {
      setError('Invalid API Key format. Google Gemini API keys typically begin with "AIzaSy" or "AQ".');
      return;
    }

    if (cleanKey.length < 20) {
      setError('The API Key you entered seems too short. Please verify your key.');
      return;
    }

    setError(null);
    onKeySubmitted(cleanKey);
  };

  return (
    <div 
      id="api-key-overlay-container"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040e0a]/95 backdrop-blur-xl px-4 py-6 overflow-y-auto"
    >
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#2E7D32]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-gradient-to-b from-[#0F3D2E]/40 to-black/80 border border-[#66BB6A]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2E7D32] to-[#66BB6A] flex items-center justify-center shadow-lg shadow-[#66BB6A]/20">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#66BB6A] bg-[#66BB6A]/10 px-3 py-1 rounded-full border border-[#66BB6A]/20">
            Access Verification Gate
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FIFA Command Center AI
          </h2>
          <p className="text-xs text-gray-300 max-w-sm mx-auto">
            A personal Google Gemini API key is required to access real-time AI operations, routing models, and multilingual assistants.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Enter Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy... or AQ.Ab..."
                className="w-full text-sm bg-black/60 border border-white/10 hover:border-[#66BB6A]/40 focus:border-[#66BB6A] rounded-xl pl-4 pr-24 py-3 text-white outline-none font-mono tracking-wider transition-all"
              />
              <div className="absolute right-2.5 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste API Key"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#66BB6A] hover:bg-white/10 transition-all flex items-center gap-1"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? "Hide key" : "Show key"}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#0F3D2E] hover:from-[#66BB6A] hover:to-[#2E7D32] text-white font-bold text-xs shadow-lg hover:shadow-[#66BB6A]/20 transition-all flex items-center justify-center gap-2 group"
          >
            Authenticate & Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Security & Instruction Info */}
        <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#66BB6A] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Local Isolation Security</strong>: Your key is saved locally in your own browser cache. No API keys are stored permanently or shared on server-side databases.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Don't have a key?</strong> You can get a free, high-limit Gemini API Key instantly from the{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#66BB6A] hover:underline font-semibold"
              >
                Google AI Studio portal
              </a>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
