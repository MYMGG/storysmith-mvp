// components/ApiKeyManager.js

import { useState, useEffect } from 'react';

export default function ApiKeyManager({ isOpen, onClose }) {
	const [apiKey, setApiKey] = useState('');
	const [showKey, setShowKey] = useState(false);

	useEffect(() => {
		// Load existing key from localStorage
		if (typeof window !== 'undefined') {
			const savedKey = localStorage.getItem('STORYSMITH_API_KEY') || '';
			setApiKey(savedKey);
		}
	}, [isOpen]);

	const handleSave = () => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('STORYSMITH_API_KEY', apiKey);
			alert('API Key saved successfully! It will be used for all AI features.');
			onClose();
		}
	};

	const handleClear = () => {
		if (typeof window !== 'undefined' && confirm('Are you sure you want to clear your API key?')) {
			localStorage.removeItem('STORYSMITH_API_KEY');
			setApiKey('');
			alert('API Key cleared.');
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
			<div
				className="bg-stone-100 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
				onClick={(e) => e.stopPropagation()}
				style={{ fontFamily: 'Lato, sans-serif' }}
			>
				<h2 className="text-2xl font-bold mb-4 text-stone-800" style={{ fontFamily: 'Cinzel, serif' }}>
					API Key Manager
				</h2>

				<p className="text-sm text-stone-600 mb-4">
					Your API key is stored <strong>locally in your browser</strong> and never committed to the repository.
				</p>

				<div className="mb-4">
					<label className="block text-sm font-semibold text-stone-700 mb-2">
						OpenAI API Key
					</label>
					<div className="relative">
						<input
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder="sk-proj-..."
							className="w-full p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-stone-200 hover:bg-stone-300 rounded"
						>
							{showKey ? '🙈 Hide' : '👁️ Show'}
						</button>
					</div>
				</div>

				<div className="flex gap-3">
					<button
						onClick={handleSave}
						className="flex-1 px-4 py-2 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800 transition-colors"
					>
						Save Key
					</button>
					<button
						onClick={handleClear}
						className="px-4 py-2 bg-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-400 transition-colors"
					>
						Clear
					</button>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-300 transition-colors"
					>
						Close
					</button>
				</div>

				<div className="mt-4 text-xs text-stone-500">
					<p className="mb-1">💡 <strong>Tip:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">platform.openai.com</a></p>
					<p>🔒 Your key is stored locally and never sent to our servers.</p>
				</div>
			</div>
		</div>
	);
}
