export default function InteractionOverlay({ interaction, onClose, onChoice }) {
    if (!interaction) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative max-w-lg w-full mx-4 p-8 bg-stone-900 border border-amber-500/30 rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-xl font-cinzel text-amber-500">
                        {interaction.label || "Interaction"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white transition-colors text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                {interaction.type === 'reveal' && (
                    <div className="space-y-4">
                        <p className="text-stone-300 font-serif text-lg leading-relaxed">
                            {interaction.content || "No content available."}
                        </p>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {interaction.type === 'choice' && (
                    <div className="space-y-4">
                        {interaction.choices && interaction.choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChoice(choice)}
                                className="w-full p-4 bg-stone-800 hover:bg-amber-900/30 border border-stone-700 hover:border-amber-600 rounded text-left transition-all group"
                            >
                                <span className="text-amber-400 group-hover:text-amber-300 font-serif text-lg">
                                    {choice.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {interaction.type === 'collect' && (
                    <div className="space-y-4">
                        <p className="text-stone-300 font-serif text-lg leading-relaxed">
                            {interaction.content || "Collected!"}
                        </p>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
