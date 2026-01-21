# Plan: TS-007 — Add Import UI to SpinTale (Act II)

## Goal
Implement the "Import Hero Bundle" functionality in Act II (SpinTale). This allows users to upload a Part1 bundle (exported from Act I) to initialize the story state for Act II, populating the hero data.

## Context
Act II requires a valid `CharacterBlock` to function. Currently, this data must come from a completed Act I session in the same browser context. To support the decoupled "Act Scoping" architecture, we need to allow users to import the `MyHeroAssetBundle_Part1.json` generated in Act I.

## Proposed Changes

### 1. UI Implementation (`components/SpinTale.js`)

We will modify `SpinTale.js` to handle the "No Hero Data" state by offering an import option.

**Current Logic:**
```javascript
if (!hasHeroData) {
  setSharedResponse("It seems our story's hero or blueprint is not yet forged!...");
  return null; // Or similar empty state
}
```

**New Logic:**
- Import `importBundle` from `../lib/bundleImporter.js`.
- Add local state: `importError` (string).
- If `!hasHeroData`, render a "Welcome to Act II" screen with:
  - A brief explanation.
  - A file input (accept `.json`).
  - An event handler `handleFileUpload(event)`:
    - Call `importBundle(file, 'Part1')`.
    - If valid:
      - Merge imported `StoryState` into main `storyState`.
      - Clear `importError`.
      - UI will automatically re-render and proceed to blueprint generation/Act II flow because `hasHeroData` will become true.
    - If invalid:
      - Set `importError` to the error message returned by the validator.

### 2. Integration Details

- **Validation**: Rely strictly on `lib/bundleValidator.js` (via `bundleImporter.js`).
- **State Update**: Ensure `setStoryState` preserves any existing non-conflicting state if necessary, though usually, we are initializing. The importer returns the full `StoryState` wrapper.
- **Error Handling**: Display errors clearly (e.g., in red text below the input).

## Verification Plan

### Automated
- `npm run build`: Ensure no regression.

### Manual Verification Steps
1.  **Launch**: `npm run dev`
2.  **Navigate**: Go to Act II (SpinTale).
3.  **Test Clean State**: Ensure the Import UI is visible.
4.  **Test Invalid File**:
    - Upload a text file or invalid JSON.
    - EXPECT: Error message "Invalid file format" or similar.
5.  **Test Wrong Bundle Type**:
    - Upload a Part2 or Final bundle (if available) or a random JSON.
    - EXPECT: Validation error from `bundleValidator`.
6.  **Test Valid Bundle**:
    - Upload `MyHeroAssetBundle_Part1.json`.
    - EXPECT: Hero data loads, UI transitions to "The Call to Adventure" (or blueprint generation).
