export default function SpreadCanvas({ imageUrl, mode }) {
    return (
        <div
            data-art-container="true"
            className="absolute inset-0 z-0 flex items-center justify-center bg-black"
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Page art"
                    className="w-full h-full object-contain"
                    draggable={false}
                />
            ) : (
                <div className="text-stone-400 text-sm">Canvas Empty</div>
            )}
        </div>
    );
}
