param(
  [Parameter(Mandatory=$false)]
  [ValidateSet("dev","build")]
  [string]$Mode = "dev",

  [Parameter(Mandatory=$false)]
  [int]$TailLines = 220
)

$ErrorActionPreference = "Stop"

function Run($cmd) {
  "`n> $cmd"
  try {
    $out = Invoke-Expression $cmd 2>&1 | Out-String
    $out.TrimEnd()
  } catch {
    $_.Exception.Message
  }
}

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location $repo

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$branch = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branch) { $branch = "(not a git repo?)" }

$report = @()
$report += "===STORYSMITH_BUGREPORT==="
$report += "Timestamp: $ts"
$report += "Repo: $repo"
$report += "Branch: $branch"

$report += Run "node -v"
$report += Run "npm -v"
$report += Run "git status --porcelain=v1"
$report += Run "git diff --name-only"

if ($Mode -eq "build") {
  $report += Run "npm run build"
} else {
  $report += Run "npm run dev"
}

$reportText = ($report -join "`n")

# Tail to keep paste small but useful
$lines = $reportText -split "`r?`n"
if ($lines.Count -gt $TailLines) {
  $lines = $lines[0..($TailLines-1)]
  $lines += "...(truncated; rerun with -TailLines 400 if needed)"
}

$final = ($lines -join "`n")
Write-Output $final
