// components/ActsBar.js
// Floating acts navigation bar, ported from storysmith-v5 UnifiedHeader
// Simplified for MVP: no project system, just activeTab-based navigation

import { Sword, Scroll, Book, CheckCircle2 } from 'lucide-react';

/**
 * ActsBar - Three-act navigation with visual progression indicators.
 * @param {Object} props
 * @param {number} props.activeTab - Current active tab (0=Forge, 1=SpinTale, 2=BindBook)
 * @param {Function} props.setActiveTab - Function to change active tab
 */
export default function ActsBar({ activeTab, setActiveTab }) {
	const acts = [
		{ name: 'Forge', icon: Sword, tabIndex: 0 },
		{ name: 'Weave', icon: Scroll, tabIndex: 1 },
		{ name: 'Bind', icon: Book, tabIndex: 2 },
	];

	/**
	 * Determine act status based on activeTab.
	 * - completed: tabs before active
	 * - active: current tab
	 * - locked: tabs after active (can still click but grayed)
	 */
	const getActStatus = (tabIndex) => {
		if (tabIndex < activeTab) return 'completed';
		if (tabIndex === activeTab) return 'active';
		return 'locked';
	};

	return (
		<div className="flex justify-center w-full py-2 relative">
			{/* Decorative background dip */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-16 bg-parchment-deep/40 blur-2xl rounded-b-full opacity-70 -z-10" />

			<nav className="flex items-center pointer-events-auto" aria-label="Quest Progress">
				{acts.map((act, index) => {
					const Icon = act.icon;
					const status = getActStatus(act.tabIndex);
					const isActive = status === 'active';
					const isCompleted = status === 'completed';
					const isLocked = status === 'locked';

					return (
						<div key={act.name} className="flex items-center">
							{/* Connector Line */}
							{index > 0 && (
								<div className={`
                  w-16 sm:w-24 md:w-32 h-[3px] 
                  transition-colors duration-300 rounded-full
                  ${isLocked ? 'bg-leather/15' : 'bg-gold/50'}
                `} />
							)}

							{/* Act Button */}
							<button
								onClick={() => setActiveTab(act.tabIndex)}
								className="flex flex-col items-center group relative z-10 mx-[-4px]"
								title={`Act ${act.tabIndex + 1}: ${act.name}`}
								disabled={false}
							>
								<div className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-300
                  ${isActive
										? 'bg-gold border-gold shadow-[0_0_35px_rgba(197,160,89,0.85),0_0_60px_rgba(197,160,89,0.4)] scale-110 text-parchment z-20 transform -translate-y-1'
										: 'bg-parchment hover:bg-parchment-deep'}
                  ${isCompleted ? 'border-gold text-gold shadow-sm' : ''}
                  ${isLocked ? 'border-leather/25 text-leather/40 bg-parchment-deep' : ''}
                  ${!isActive && !isCompleted && !isLocked ? 'border-gold/70 text-gold' : ''}
                `}>
									{isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
								</div>
								<span
									className={`
                    absolute top-[120%] w-max text-sm font-bold font-heading tracking-widest uppercase transition-colors
                    ${isActive ? 'text-gold' : ''}
                    ${isCompleted ? 'text-gold' : ''}
                    ${isLocked ? 'text-stone-400' : ''}
                    ${!isActive && !isCompleted && !isLocked ? 'text-stone-300' : ''}
                  `}
									style={isActive ? { textShadow: '0 1px 3px rgba(0,0,0,0.3)' } : {}}
								>
									{act.name}
								</span>
							</button>
						</div>
					);
				})}
			</nav>
		</div>
	);
}
