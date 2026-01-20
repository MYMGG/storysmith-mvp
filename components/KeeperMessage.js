import React from 'react';

export default function KeeperMessage({ text }) {
  return (
    <div className="flex items-start space-x-4 mb-6">
      {/* Placeholder avatar emoji */}
      <div className="text-4xl">🧙‍♂️</div>
      <div className="relative bg-amber-700 bg-opacity-90 text-stone-900 p-4 rounded-2xl max-w-prose">
        <p className="whitespace-pre-line typewriter-effect">
          {text}
        </p>
        {/* Speech-bubble arrow */}
        <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-amber-700 border-b-8 border-b-transparent" />
      </div>
    </div>
  );
}