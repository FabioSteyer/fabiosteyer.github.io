# Baut die Seite und veroeffentlicht den fertigen Build im Branch gh-pages.
# Hintergrund und Rueckbau: siehe DEPLOY.md.
# Aufruf aus dem Projektordner:  npm run deploy

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

Write-Host "== Build =="
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build fehlgeschlagen." }

New-Item -ItemType File -Path (Join-Path $repo 'dist\.nojekyll') -Force | Out-Null

$wt = Join-Path (Split-Path -Parent $repo) '_gh-pages-wt'
$tmpBranch = 'gh-pages-tmp-' + (Get-Date -Format 'yyyyMMddHHmmss')

if (Test-Path $wt) { git worktree remove $wt --force }

Write-Host "== Arbeitskopie anlegen =="
git worktree add --orphan -b $tmpBranch $wt
if ($LASTEXITCODE -ne 0) { throw "worktree add fehlgeschlagen." }

try {
    Copy-Item -Path (Join-Path $repo 'dist\*') -Destination $wt -Recurse -Force
    Copy-Item -Path (Join-Path $repo 'dist\.nojekyll') -Destination $wt -Force

    Push-Location $wt
    git add -A
    git commit -q -m ("Build " + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
    if ($LASTEXITCODE -ne 0) { throw "commit fehlgeschlagen." }
    git push -q -f origin "HEAD:gh-pages"
    if ($LASTEXITCODE -ne 0) { throw "push fehlgeschlagen." }
    Pop-Location
}
finally {
    if (Test-Path $wt) { git worktree remove $wt --force }
    git branch -D $tmpBranch 2>$null | Out-Null
}

Write-Host "== Pages-Build anstossen =="
gh api -X POST repos/FabioSteyer/fabiosteyer.github.io/pages/builds | Out-Null

Write-Host ""
Write-Host "Fertig. Der Pages-Build laeuft etwa 20 Sekunden."
Write-Host "Status pruefen:  gh api repos/FabioSteyer/fabiosteyer.github.io/pages/builds/latest"
Write-Host "Seite:           https://fabiosteyer.github.io/"
