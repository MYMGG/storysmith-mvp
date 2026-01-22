// components/TranslucentHeader.js
// Translucent header bar with V5-style glassmorphism
// Leaves center empty for ActsBar to float below

import React from 'react';

/**
 * TranslucentHeader - Translucent navigation header with blur effect.
 * @param {Object} props
 * @param {Function} props.onHomeClick - Callback when Home/logo is clicked
 */
export default function TranslucentHeader({ onHomeClick }) {
	return (
		<header className="w-full border-b border-leather/20 bg-parchment-deep/50 backdrop-blur-sm shadow-sm z-50">
			<div className="max-w-screen-2xl mx-auto px-8 py-4 flex justify-between items-center">
				{/* Left: Brand/Logo */}
				<h1
					className="text-4xl sm:text-5xl font-extrabold text-stone-200 cursor-pointer hover:text-white transition-colors"
					style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 5px rgba(255, 255, 255, 0.2)' }}
					onClick={onHomeClick}
				>
					StorySmith
				</h1>

				{/* Center: Empty slot (ActsBar floats below) */}
				<div className="flex-1" />

				{/* Right: Navigation */}
				<nav>
					<ul className="flex space-x-6">
						<li>
							<a
								href="#"
								onClick={(e) => { e.preventDefault(); onHomeClick?.(); }}
								className="text-gray-300 hover:text-white transition-colors"
							>
								Home
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
}
