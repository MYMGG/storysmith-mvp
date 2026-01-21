export default function ProgressBar({ progress, chromeVisible }) {
    return (
        <div
            className={`absolute bottom-0 left-0 w-full h-1 bg-stone-800 z-40 transition-opacity duration-300 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="h-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
