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

// ViewerContent receives injected props from BookShell
function ViewerContent({
  book,
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

  useEffect(() => {
    if (!resolvedBookId) return;

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
  }, [resolvedBookId]);

  if (!resolvedBookId) return null;

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
      <ViewerContent book={book} />
    </BookShell>
  );
}
