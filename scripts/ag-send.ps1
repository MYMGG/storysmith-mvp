param(
  [Parameter(Mandatory = $true)]
  [string]$Text,
  [string]$WindowTitle = "",
  [int]$DelayMs = 150,
  [switch]$NoEnter
)

$ErrorActionPreference = "Stop"

function Get-AutoHotkeyPath {
  $candidatePaths = @(
    (Get-Command "AutoHotkey64.exe" -ErrorAction SilentlyContinue)?.Source,
    (Get-Command "AutoHotkey.exe" -ErrorAction SilentlyContinue)?.Source,
    "$env:ProgramFiles\AutoHotkey\AutoHotkey64.exe",
    "$env:ProgramFiles\AutoHotkey\AutoHotkey.exe",
    "$env:ProgramFiles(x86)\AutoHotkey\AutoHotkey.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  return $candidatePaths | Select-Object -First 1
}

function Install-AutoHotkey {
  Write-Host "AutoHotkey not found. Installing via winget..."
  $winget = Get-Command "winget.exe" -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw "winget is required to auto-install AutoHotkey. Install AutoHotkey manually and rerun."
  }

  & $winget.Source install --id AutoHotkey.AutoHotkey --accept-package-agreements --accept-source-agreements
}

$autoHotkeyPath = Get-AutoHotkeyPath
if (-not $autoHotkeyPath) {
  Install-AutoHotkey
  $autoHotkeyPath = Get-AutoHotkeyPath
}

if (-not $autoHotkeyPath) {
  throw "AutoHotkey install failed. Please install manually and rerun."
}

$sendEnterValue = if ($NoEnter) { "false" } else { "true" }

$scriptContent = @"
#Requires AutoHotkey v2.0
Text := A_Args[1]
WindowTitle := A_Args.Length >= 2 ? A_Args[2] : ""
DelayMs := A_Args.Length >= 3 ? Integer(A_Args[3]) : 150
SendEnter := A_Args.Length >= 4 ? (A_Args[4] = "true") : true

if (WindowTitle != "") {
  WinActivate WindowTitle
  WinWaitActive WindowTitle, , 2
}

Sleep DelayMs
A_Clipboard := Text
ClipWait 1
Send "^v"
if (SendEnter) {
  Send "{Enter}"
}
ExitApp
"@

$tempScriptPath = Join-Path $env:TEMP "ag_send.ahk"
Set-Content -Path $tempScriptPath -Value $scriptContent -Encoding ASCII

& $autoHotkeyPath $tempScriptPath $Text $WindowTitle $DelayMs $sendEnterValue
