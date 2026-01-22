// components/TranslucentHeader.js
// Translucent header bar with V5-style glassmorphism
// Leaves center empty for ActsBar to float below

import React from 'react';

/**
 * TranslucentHeader - Translucent navigation header with blur effect.
 * @param {Object} props
 * @param {Function} props.onHomeClick - Callback when logo is clicked
 * @param {React.ReactNode} [props.rightSlot] - Optional content for right side (e.g. ProjectSelector)
 */
export default function TranslucentHeader({ onHomeClick, rightSlot }) {
	return (
		<header className="w-full border-b border-leather/20 bg-parchment-deep/50 backdrop-blur-sm shadow-sm z-50">
			<div className="max-w-screen-2xl mx-auto px-6 py-2 flex justify-between items-center">
				{/* Left: Brand/Logo - clickable as home */}
				<h1
					className="text-2xl sm:text-3xl font-extrabold text-stone-200 cursor-pointer hover:text-white transition-colors"
					style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 4px rgba(255, 255, 255, 0.15)' }}
					onClick={onHomeClick}
				>
					StorySmith
				</h1>

				{/* Center: Empty slot (ActsBar floats as overlay) */}
				<div className="flex-1" />

				{/* Right: Optional slot for ProjectSelector or other controls */}
				{rightSlot && <div>{rightSlot}</div>}
			</div>
		</header>
	);
}
