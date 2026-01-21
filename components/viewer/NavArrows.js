export default function NavArrows({ onPrev, onNext, showPrev, showNext }) {
    return (
        <>
            {showPrev && (
                <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-4 text-white bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm transition-colors">
                    ←
                </button>
            )}
            {showNext && (
                <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-4 text-white bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm transition-colors">
                    →
                </button>
            )}
        </>
    );
}
