import { useState, useEffect } from 'react';
import InteractionOverlay from './InteractionOverlay';

// Occlusion helper: check if two normalized rects overlap
function rectsOverlap(a, b) {
    return !(
        a.x + a.w < b.x ||
        b.x + b.w < a.x ||
        a.y + a.h < b.y ||
        b.y + b.h < a.y
    );
}

export default function HotspotLayer({ hotspots, mode, vellumExpanded, flags, setFlag }) {
    const [activeInteraction, setActiveInteraction] = useState(null);
    const [vellumBounds, setVellumBounds] = useState(null);

    // Read vellum bounds from DOM attribute (set by VellumCard)
    useEffect(() => {
        const checkBounds = () => {
            const boundsAttr = document.documentElement.getAttribute('data-vellum-bounds');
            if (boundsAttr) {
                try {
                    setVellumBounds(JSON.parse(boundsAttr));
                } catch (e) {
                    setVellumBounds(null);
                }
            } else {
                setVellumBounds(null);
            }
        };

        checkBounds();
        const observer = new MutationObserver(checkBounds);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-vellum-bounds'] });
        return () => observer.disconnect();
    }, []);

    if (!hotspots || hotspots.length === 0) return null;

    const handleHotspotClick = (hs) => {
        // Occlusion check: if Storybook + vellum expanded + hotspot overlaps vellum, block
        if (mode === 'storybook' && vellumExpanded && vellumBounds) {
            if (rectsOverlap(hs.rect, vellumBounds)) {
                return; // Blocked by occlusion
            }
        }

        if (hs.type === 'collect') {
            const alreadyCollected = flags[hs.flag];
            if (!alreadyCollected) {
                setFlag(hs.flag, true);
                setActiveInteraction({ ...hs, content: hs.content || "Collected!" });
            } else {
                setActiveInteraction({ ...hs, content: "You already collected this." });
            }
        } else {
            setActiveInteraction(hs);
        }
    };

    const handleChoice = (choice) => {
        setFlag(choice.flag, true);
        setActiveInteraction(null);
        setTimeout(() => {
            setActiveInteraction({ type: 'reveal', label: 'Result', content: choice.result });
        }, 200);
    };

    return (
        <>
            <div className="absolute inset-0 z-10">
                {hotspots.map(hs => {
                    const isCompleted = hs.flag && flags[hs.flag];

                    // Check if occluded
                    const isOccluded = mode === 'storybook' && vellumExpanded && vellumBounds && rectsOverlap(hs.rect, vellumBounds);

                    return (
                        <button
                            key={hs.id}
                            onClick={() => handleHotspotClick(hs)}
                            className={`absolute border-2 rounded-full transition-all
                        ${isOccluded ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
                        ${isCompleted ? 'bg-amber-500/30 border-amber-400' : 'bg-white/20 hover:bg-white/30 border-white/50'}
                    `}
                            style={{
                                left: `${hs.rect.x * 100}%`,
                                top: `${hs.rect.y * 100}%`,
                                width: `${hs.rect.w * 100}%`,
                                height: `${hs.rect.h * 100}%`
                            }}
                            title={hs.label}
                            disabled={isOccluded}
                        >
                            {isCompleted && <span className="text-amber-300 shadow-black drop-shadow-md">✓</span>}
                        </button>
                    );
                })}
            </div>

            <InteractionOverlay
                interaction={activeInteraction}
                onClose={() => setActiveInteraction(null)}
                onChoice={handleChoice}
            />
        </>
    );
}
