import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import BookShell from "../../components/viewer/BookShell";
import SpreadCanvas from "../../components/viewer/SpreadCanvas";
import ReaderPanel from "../../components/viewer/ReaderPanel";
import VellumCard from "../../components/viewer/VellumCard";
import HotspotLayer from "../../components/viewer/HotspotLayer";
import SettingsDrawer from "../../components/viewer/SettingsDrawer";
import TocDrawer from "../../components/viewer/TocDrawer";
import NavArrows from "../../components/viewer/NavArrows";
import ProgressBar from "../../components/viewer/ProgressBar";
import { normalizeToStoryState, toViewerBook } from "../../lib/storyState";
import { importBundle, importBundleFromString } from "../../lib/bundleImporter";

// ViewerContent receives injected props from BookShell
function ViewerContent({
  book,
  storyState,
  mode,
  vellumExpanded,
  setVellumExpanded,
  vellumPosition,
  setVellumPosition,
  fontScale,
  flags,
  setFlag,
  currentIndex,
  setCurrentIndex,
  chromeVisible,
  settingsOpen,
  setSettingsOpen,
  tocOpen,
  setTocOpen,
  theme,
  setTheme,
  resetProgress
}) {
  // Guard bounds
  const safeIndex = Math.max(0, Math.min(currentIndex, book.pages.length - 1));
  const page = book.pages[safeIndex];

  // Calculate progress
  const progress = book.pages.length > 1
    ? (safeIndex / (book.pages.length - 1)) * 100
    : 0;

  // Navigation handlers
  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (safeIndex < book.pages.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  // TOC navigation handler
  const handleTocNavigate = (chapterId) => {
    const pageIndex = book.pages.findIndex(p => p.id === chapterId);
    if (pageIndex >= 0) {
      setCurrentIndex(pageIndex);
    }
  };

  return (
    <>
      {/* Art Canvas */}
      <SpreadCanvas
        imageUrl={page?.imageUrl}
        mode={mode}
        book={book}
        currentIndex={safeIndex}
      />

      {/* Reader Panel (Reader mode only) */}
      <ReaderPanel
        text={page?.text}
        mode={mode}
        fontScale={fontScale}
      />

      {/* Vellum Card (Storybook mode only) */}
      <VellumCard
        text={page?.text}
        mode={mode}
        vellumExpanded={vellumExpanded}
        setVellumExpanded={setVellumExpanded}
        vellumPosition={vellumPosition}
        setVellumPosition={setVellumPosition}
      />

      {/* Hotspot Layer */}
      <HotspotLayer
        hotspots={page?.hotspots || []}
        mode={mode}
        vellumExpanded={vellumExpanded}
        flags={flags}
        setFlag={setFlag}
      />

      {/* Navigation Arrows */}
      <NavArrows
        onPrev={handlePrev}
        onNext={handleNext}
        showPrev={safeIndex > 0}
        showNext={safeIndex < book.pages.length - 1}
      />

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        chromeVisible={chromeVisible}
      />

      {/* Settings Drawer */}
      <SettingsDrawer
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        theme={theme}
        setTheme={setTheme}
        resetProgress={resetProgress}
        storyState={storyState}
      />

      {/* TOC Drawer with navigation */}
      <TocDrawer
        tocOpen={tocOpen}
        setTocOpen={setTocOpen}
        chapters={book.tableOfContents || []}
        onNavigate={handleTocNavigate}
      />
    </>
  );
}

export default function ViewerBookPage() {
  const router = useRouter();
  const { bookId } = router.query;

  const resolvedBookId = useMemo(() => {
    if (!bookId) return null;
    return Array.isArray(bookId) ? bookId[0] : bookId;
  }, [bookId]);

  const [book, setBook] = useState(null);
  const [storyState, setStoryState] = useState(null);
  const [err, setErr] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const uploadMode = resolvedBookId === 'upload';
  const uploadSource = useMemo(() => {
    if (!router.query?.source) return null;
    return Array.isArray(router.query.source) ? router.query.source[0] : router.query.source;
  }, [router.query?.source]);

  const handleBundleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const result = await importBundle(file, 'Final');
      if (!result.success) {
        setUploadError(result.errors);
        return;
      }
      const viewerBook = toViewerBook(result.storyState);
      setStoryState(result.storyState);
      setBook(viewerBook);
      setErr(null);
    } catch (error) {
      setUploadError([error.message || 'Failed to read bundle.']);
    }
  };

  useEffect(() => {
    if (!resolvedBookId || uploadMode) return;

    let cancelled = false;
    const url = `/books/${resolvedBookId}-book.json`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          // Normalize to canonical StoryState, then convert to viewer schema
          const normalized = normalizeToStoryState(data);
          const viewerBook = toViewerBook(normalized);
          setStoryState(normalized);
          setBook(viewerBook);
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e?.message || String(e));
      });

    return () => { cancelled = true; };
  }, [resolvedBookId, uploadMode]);

  useEffect(() => {
    if (!uploadMode || uploadSource !== 'local' || book) return;
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('storysmith_final_bundle');
    if (!stored) {
      setUploadError(["No local final bundle found. Please upload a file."]);
      return;
    }

    const result = importBundleFromString(stored, 'Final');
    if (!result.success) {
      setUploadError(result.errors);
      return;
    }
    const viewerBook = toViewerBook(result.storyState);
    setStoryState(result.storyState);
    setBook(viewerBook);
  }, [uploadMode, uploadSource, book]);

  if (!resolvedBookId) return null;

  if (uploadMode && !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100 p-6">
        <div className="w-full max-w-lg bg-black/40 border border-stone-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
            Open a Final Bundle
          </h1>
          <p className="text-sm text-stone-300">
            Upload your `MyStoryAssetBundle_Final.json` file to view the full illustrated book.
          </p>
          <label className="block w-full cursor-pointer">
            <div className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-stone-600 rounded-lg hover:border-amber-500/50 transition-colors">
              <span className="text-sm text-stone-300">Choose final bundle</span>
            </div>
            <input type="file" className="hidden" accept=".json,application/json" onChange={handleBundleUpload} />
          </label>
          {uploadError && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-left">
              <p className="font-bold mb-1">Upload Failed</p>
              <ul className="list-disc list-inside space-y-1">
                {uploadError.map((errorItem, index) => (
                  <li key={index}>{errorItem}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Viewer error</h1>
        <pre>{err}</pre>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        Loading book…
      </div>
    );
  }

  return (
    <BookShell bookTitle={book.title} bookId={resolvedBookId} storyState={storyState}>
      <ViewerContent book={book} storyState={storyState} />
    </BookShell>
  );
}
