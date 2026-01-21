import { motion, AnimatePresence } from 'framer-motion';

export default function TocDrawer({ tocOpen, setTocOpen, chapters, onNavigate }) {
    return (
        <AnimatePresence>
            {tocOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setTocOpen(false)}
                        className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-y-0 left-0 w-80 z-50 p-6 shadow-2xl border-r border-white/10"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-xl font-cinzel text-amber-500">Contents</h2>
                            <button
                                onClick={() => setTocOpen(false)}
                                className="p-2 text-stone-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <ul className="space-y-4">
                            {chapters && chapters.map(chap => (
                                <li key={chap.id}>
                                    <button
                                        className="w-full text-left group flex items-baseline"
                                        onClick={() => {
                                            if (onNavigate) {
                                                onNavigate(chap.id);
                                            }
                                            setTocOpen(false);
                                        }}
                                    >
                                        <span className="w-6 text-xs text-stone-600 font-mono">0{chapters.indexOf(chap) + 1}</span>
                                        <span
                                            className="text-lg font-serif text-stone-300 group-hover:text-amber-400 transition-colors"
                                        >
                                            {chap.title}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
