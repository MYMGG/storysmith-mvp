export default function SettingsDrawer({ settingsOpen, setSettingsOpen, theme, setTheme, resetProgress }) {
    if (!settingsOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setSettingsOpen(false)}
            />

            <div
                className="absolute inset-y-0 right-0 w-80 z-50 p-6 shadow-2xl border-l border-white/10 flex flex-col bg-stone-900"
            >
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-cinzel text-amber-500">Settings</h2>
                    <button onClick={() => setSettingsOpen(false)} className="text-stone-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-6 flex-grow">
                    {/* Theme Section */}
                    <div>
                        <h3 className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-3">Theme</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['day', 'night', 'lamp', 'system'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`p-3 rounded border capitalize text-sm transition-all
                     ${theme === t
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                                            : 'border-stone-700 hover:border-stone-500 text-stone-500'}
                   `}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other settings stubs can go here */}
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={() => {
                            if (confirm("Reset reading progress and collectibles?")) {
                                resetProgress();
                                setSettingsOpen(false);
                            }
                        }}
                        className="w-full p-3 border border-red-900/50 text-red-700 hover:bg-red-900/10 rounded text-sm uppercase tracking-wider font-bold transition-colors"
                    >
                        Reset Progress
                    </button>
                </div>
            </div>
        </>
    );
}
