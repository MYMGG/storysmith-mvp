# ss-reset-progress.ps1 v2
# Purpose: Print deterministic, scoped instructions to reset ONLY the viewer resume key for a given bookId.

param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern('^[a-zA-Z0-9_-]+$')]
  [string]$BookId
)

$ErrorActionPreference = "Stop"

$origin  = "http://localhost:3000"
$keyName = "storysmith_v1_progress_$BookId"

# Chromium user data roots
$chromeRoot = Join-Path -Path $env:LOCALAPPDATA -ChildPath "Google\Chrome\User Data"
$edgeRoot   = Join-Path -Path $env:LOCALAPPDATA -ChildPath "Microsoft\Edge\User Data"

$roots = @()
if (Test-Path -LiteralPath $chromeRoot) { $roots += $chromeRoot }
if (Test-Path -LiteralPath $edgeRoot)   { $roots += $edgeRoot }

# Candidate profiles (common)
$profileNames = @("Default","Profile 1","Profile 2","Profile 3","Profile 4","Profile 5")

$leveldbFolders = @()
foreach ($root in $roots) {
  foreach ($pname in $profileNames) {
    $pdir = Join-Path -Path $root -ChildPath $pname
    if (-not (Test-Path -LiteralPath $pdir)) { continue }
    $ls = Join-Path -Path $pdir -ChildPath "Local Storage\leveldb"
    if (Test-Path -LiteralPath $ls) { $leveldbFolders += $ls }
  }
}

# We do NOT modify LevelDB automatically (unsafe & brittle). We provide safe, scoped instructions.
$js = "localStorage.removeItem('$keyName'); location.reload();"

"===BEGIN_SHARE==="
"Status: OK_INSTRUCTIONS_ONLY"
"Outputs:"
"  Origin: $origin"
"  ViewerURL: $origin/viewer/$BookId"
"  KeyToRemove: $keyName"
"  JS_OneLiner (paste into DevTools Console on the viewer page):"
"    $js"
"  DetectedLevelDBFolders (informational):"
if ($leveldbFolders.Count -gt 0) {
  $leveldbFolders | ForEach-Object { "    - $_" }
} else {
  "    (none detected for Chrome/Edge Default/Profile 1-5)"
}
"NEEDED_FROM_USER:"
"  1) Open: $origin/viewer/$BookId"
"  2) Open DevTools -> Console"
"  3) Paste the JS_OneLiner above"
"  4) Confirm the viewer now starts on cover (currentIndex=0)"
"NextStep:"
"  If you want a TRUE one-command reset (no DevTools), I will implement a viewer URL override (e.g. ?fresh=1) that clears ONLY this key from inside the app at runtime."
"===END_SHARE==="
