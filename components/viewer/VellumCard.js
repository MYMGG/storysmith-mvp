import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function VellumCard({ text, vellumExpanded, setVellumExpanded, mode, vellumPosition, setVellumPosition }) {
    const cardRef = useRef(null);
    const [cardBounds, setCardBounds] = useState(null);

    // Update card bounds for occlusion detection
    useEffect(() => {
        if (!cardRef.current || !vellumExpanded || mode !== 'storybook') {
            setCardBounds(null);
            return;
        }

        const updateBounds = () => {
            const artEl = document.querySelector('[data-art-container="true"]');
            if (!artEl || !cardRef.current) {
                setCardBounds(null);
                return;
            }

            const artRect = artEl.getBoundingClientRect();
            const cardRect = cardRef.current.getBoundingClientRect();

            // Normalize to art container space (not viewport)
            const x = Math.max(0, Math.min(1, (cardRect.left - artRect.left) / artRect.width));
            const y = Math.max(0, Math.min(1, (cardRect.top - artRect.top) / artRect.height));
            const w = Math.max(0, Math.min(1, cardRect.width / artRect.width));
            const h = Math.max(0, Math.min(1, cardRect.height / artRect.height));

            setCardBounds({ x, y, w, h });
        };

        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, [vellumExpanded, setCardBounds, mode]);

    // Expose card bounds to parent via data attribute (HotspotLayer can read)
    useEffect(() => {
        if (cardBounds && vellumExpanded && mode === 'storybook') {
            document.documentElement.setAttribute('data-vellum-bounds', JSON.stringify(cardBounds));
        } else {
            document.documentElement.removeAttribute('data-vellum-bounds');
        }
    }, [cardBounds, vellumExpanded, mode]);

    // Only render in Storybook mode
    if (mode !== 'storybook') return null;

    return (
        <motion.div
            ref={cardRef}
            drag={vellumExpanded}
            dragConstraints={{ left: -100, right: 100, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
                if (setVellumPosition) {
                    setVellumPosition({ x: info.offset.x, y: info.offset.y });
                }
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{
                y: vellumExpanded ? 0 : 'calc(100% - 80px)',
                opacity: 1,
                width: vellumExpanded ? 'auto' : '300px',
                height: vellumExpanded ? 'auto' : '60px',
                x: vellumPosition?.x || 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute z-30 mx-auto left-4 right-4 md:left-auto md:right-auto md:w-[600px]
        ${vellumExpanded ? 'bottom-8' : 'bottom-4'}
        backdrop-blur-md shadow-2xl rounded-xl border border-white/20 overflow-hidden
      `}
            style={{
                backgroundColor: 'rgba(255, 251, 235, 0.9)',
                color: '#1c1917'
            }}
        >
            <div className="relative p-6">
                <AnimatePresence mode="wait">
                    {vellumExpanded ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="font-serif text-lg leading-relaxed text-stone-900 drop-shadow-sm">
                                {text || "No text content..."}
                            </p>
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => setVellumExpanded(false)}
                                    className="text-xs uppercase tracking-widest text-amber-900/60 hover:text-amber-800 font-bold"
                                >
                                    Explore Art
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-between h-full cursor-pointer"
                            onClick={() => setVellumExpanded(true)}
                        >
                            <span className="font-serif italic text-stone-600 truncate mr-4">
                                {text ? text.substring(0, 40) + "..." : "Read text"}
                            </span>
                            <span className="text-xs uppercase font-bold text-amber-700">Read</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
