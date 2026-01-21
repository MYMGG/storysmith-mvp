export default function ReaderPanel({ text, mode, fontScale }) {
    // Render content
    const content = (
        <div className="absolute inset-0 flex flex-col md:flex-row z-20">
            {/* Left/Top Panel: Transparent hole for SpreadCanvas (z-0) */}
            <div className="w-full h-1/2 md:w-1/2 md:h-full pointer-events-none border-b md:border-b-0 md:border-r border-stone-700/20">
                {/* Art shows through from SpreadCanvas below */}
            </div>

            {/* Text Panel */}
            <div
                className="w-full h-1/2 md:w-1/2 md:h-full overflow-y-auto p-8 md:p-12 transition-colors duration-500 bg-stone-100"
            >
                <div
                    className="max-w-prose mx-auto font-serif leading-relaxed transition-all duration-300 text-stone-900"
                    style={{
                        fontSize: `${1.125 * (fontScale || 1)}rem`
                    }}
                >
                    {text || "No text content..."}
                </div>
            </div>
        </div>
    );

    // Only render in reader mode
    if (mode !== 'reader') return null;
    return content;
}
