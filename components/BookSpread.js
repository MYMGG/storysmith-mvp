// components/BookSpread.js
// Presentational book shell with 2-page spread layout and flip animation
// Ported from storysmith-v5 BookInterface.tsx (layout only, no API logic)

import { useState, forwardRef, useImperativeHandle } from 'react';

/**
 * BookSpread - A two-page open book layout with flip animation.
 * @param {Object} props
 * @param {React.ReactNode} props.left - Content for the left page (e.g., video)
 * @param {React.ReactNode} props.right - Content for the right page (e.g., ForgeHero)
 * @param {string|React.ReactNode} [props.leftSubtitle] - Subtitle text under left page content
 * @param {Function} [props.onFlipStart] - Callback when flip animation starts
 * @param {Function} [props.onFlipMidpoint] - Callback at flip midpoint (content swap point)
 * @param {Function} [props.onFlipEnd] - Callback when flip animation ends
 */
const BookSpread = forwardRef(function BookSpread({ left, right, leftSubtitle, onFlipStart, onFlipMidpoint, onFlipEnd }, ref) {
	// Animation state machine: 'idle' | 'fading-out' | 'closing' | 'reset' | 'opening' | 'fading-in-content'
	const [animState, setAnimState] = useState('idle');

	// Expose triggerFlip to parent via ref
	useImperativeHandle(ref, () => ({
		triggerFlip
	}), [animState]); // Re-create when animState changes to ensure fresh closure

	/**
	 * Triggers the page flip animation sequence.
	 * Can be called externally via ref or passed as callback to children.
	 */
	const triggerFlip = () => {
		if (animState !== 'idle') return; // Prevent re-triggering during animation

		onFlipStart?.();

		// ONE: Fade Out Text (0.5s)
		setAnimState('fading-out');

		setTimeout(() => {
			// TWO: Closing Phase (Right Page Shrinks) (0.5s)
			setAnimState('closing');

			setTimeout(() => {
				// THREE: RESET / SWAP Phase (Instant) - Invoke midpoint callback for content swap
				setAnimState('reset');
				onFlipMidpoint?.(); // Content should swap here

				// Force a browser repaint before starting the next animation
				requestAnimationFrame(() => {
					setTimeout(() => {
						// FOUR: Opening Phase (Left Page Expands) (0.45s)
						setAnimState('opening');

						// FIVE: Content Fade In (0.5s)
						setTimeout(() => {
							setAnimState('fading-in-content');
							// SIX: Idle (Reset for interaction)
							setTimeout(() => {
								setAnimState('idle');
								onFlipEnd?.();
							}, 500);
						}, 500);
					}, 20);
				});

			}, 500); // 500ms duration for 'closing'

		}, 500); // 500ms duration for 'fading-out'
	};

	return (
		<div className="flex items-center justify-center w-full h-full p-4 sm:p-8" style={{ perspective: '1000px' }}>
			{/* Aspect Ratio Container for the Open Book */}
			<div className="relative w-full max-w-6xl aspect-[3/2] bg-parchment-deep rounded-2xl shadow-2xl flex border-4 border-leather/30 transition-transform duration-700 overflow-hidden">

				{/* === STATIC BACKGROUND PAGES (The "Under-Pages") === */}
				<div className="absolute inset-0 flex z-0">
					<div className="w-1/2 h-full bg-parchment rounded-l-xl border-r border-leather/5" />
					<div className="w-1/2 h-full bg-parchment rounded-r-xl border-l border-leather/5" />
				</div>

				{/* === LEFT SHADOW OVERLAY === */}
				<div className={`
          absolute left-0 top-0 bottom-0 w-1/2 bg-black/15 pointer-events-none z-[15]
          ${(animState === 'closing' || animState === 'reset' || animState === 'opening') ? 'animate-shadow-fade-in' : 'opacity-0'}
        `} />

				{/* === RIGHT SHADOW OVERLAY === */}
				<div className={`
          absolute right-0 top-0 bottom-0 w-1/2 bg-black/15 pointer-events-none z-[5]
          ${(animState === 'closing' || animState === 'reset' || animState === 'opening') ? 'animate-shadow-fade-out' : 'opacity-0'}
        `} />

				{/* === GLOBAL CREASE OVERLAY (Permanent Spine Shadow) === */}
				<div className="absolute inset-0 pointer-events-none z-30">
					{/* Left Side Crease */}
					<div className="absolute top-0 right-1/2 bottom-0 w-16 bg-gradient-to-l from-black/10 to-transparent" />
					{/* Right Side Crease */}
					<div className="absolute top-0 left-1/2 bottom-0 w-16 bg-gradient-to-r from-black/5 to-transparent" />
				</div>

				{/* Book Spine (Independent, Centered) */}
				<div className="absolute left-1/2 top-2 bottom-2 w-px bg-leather/10 shadow-inner z-40" />

				{/* === LEFT PAGE === */}
				<div className={`
          w-1/2 p-4 sm:p-6 flex flex-col bg-parchment rounded-l-xl relative overflow-hidden
          origin-right shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.1)]
          ${animState === 'opening' ? 'z-20' : 'z-10'}
          ${animState === 'reset' ? 'transition-none scale-x-0' : 'transition-transform duration-500 ease-out'}
          ${(animState === 'closing' || animState === 'fading-out' || animState === 'idle') ? 'scale-x-100' : ''}
          ${(animState === 'opening' || animState === 'fading-in-content') ? 'scale-x-100' : ''}
          ${animState === 'reset' ? 'scale-x-0' : ''} 
        `}>

					{/* Content Wrapper */}
					<div className={`
            flex-1 flex flex-col transition-opacity duration-700
            ${(animState === 'fading-in-content' || animState === 'idle') ? 'opacity-100' : 'opacity-0'}
          `}>
						{/* Media Placeholder - Video goes here */}
						<div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden relative bg-parchment-deep/20">
							{left || (
								<span className="text-leather/40 font-heading italic">Animated Character</span>
							)}
						</div>
						{/* Subtitle area under video */}
						{leftSubtitle && (
							<div className="mt-2 px-3 py-2 text-center text-base text-leather font-body leading-relaxed bg-parchment-deep/50 rounded-md max-h-24 overflow-y-auto">
								{leftSubtitle}
							</div>
						)}
						<div className="absolute bottom-4 left-6 text-xs text-leather/40 font-heading">Page 1</div>
					</div>
				</div>


				{/* === RIGHT PAGE === */}
				<div className={`
          w-1/2 relative bg-parchment rounded-r-xl overflow-hidden
          origin-left z-10 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.1)]
          ${animState === 'fading-in-content' ? 'transition-none' : 'transition-transform duration-500 ease-in'}
          ${(animState === 'closing' || animState === 'reset' || animState === 'opening') ? 'scale-x-0' : 'scale-x-100'}
        `}>

					{/* Content Container */}
					<div className={`
            absolute inset-0 p-4 sm:p-6 flex flex-col
            transition-opacity duration-1000
            ${(animState === 'fading-out' || animState === 'closing' || animState === 'reset' || animState === 'opening') ? 'opacity-0' : 'opacity-100'}
          `}>
						{/* ForgeHero content goes here */}
						<div className="flex-1 overflow-y-auto">
							{right || (
								<span className="text-leather/40 font-heading italic">Story Content</span>
							)}
						</div>
						<div className="absolute bottom-4 right-6 text-xs text-leather/40 font-heading">Page 2</div>
					</div>
				</div>
			</div>

			{/* styled-jsx keyframes for shadow fade animations */}
			<style jsx>{`
        @keyframes openLeft {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes fadeInShadow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOutShadow {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-shadow-fade-out {
          animation: fadeOutShadow 1s ease-out forwards;
        }
        .animate-shadow-fade-in {
          animation: fadeInShadow 1s ease-in forwards;
        }
      `}</style>
		</div>
	);
});

export default BookSpread;
