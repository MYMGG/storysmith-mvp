export default function ModeToggle({ mode, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="absolute top-20 right-4 z-40 bg-stone-800 text-stone-200 px-4 py-2 rounded shadow-lg border border-stone-600 hover:bg-stone-700 font-sans text-sm"
        >
            Switch to {mode === 'storybook' ? 'Reader' : 'Storybook'}
        </button>
    );
}
