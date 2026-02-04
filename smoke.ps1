Param(
  [int]$TimeoutSeconds = 90,
  [string]$BaseUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"

function Ok($msg)  { Write-Host ("OK  " + $msg) }
function Warn($msg){ Write-Host ("WARN " + $msg) -ForegroundColor Yellow }
function Fail($msg){ Write-Host ("FAIL " + $msg) -ForegroundColor Red; exit 1 }

function Wait-Http200 {
  param([string]$Url, [int]$Timeout = 60)
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $Timeout) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { return $true }
    } catch { Start-Sleep -Seconds 2 }
  }
  return $false
}

Ok "Smoke test start"

# Containers
$ps = docker compose ps --format json | ConvertFrom-Json
if ($ps.Count -eq 0) { Fail "No running services. Run: docker compose up -d" }

$svcDb = $ps | Where-Object { $_.Service -like "*db*" } | Select-Object -First 1
$svcBe = $ps | Where-Object { $_.Service -like "*backend*" } | Select-Object -First 1

if ($svcDb -and $svcDb.State -ne "running") { Fail ("DB not running (State=" + $svcDb.State + ")") } else { Ok "DB running" }
if ($svcBe -and $svcBe.State -ne "running") { Fail ("Backend not running (State=" + $svcBe.State + ")") } else { Ok "Backend running" }

# DB query
if ($svcDb) {
  docker compose exec -T db psql -U postgres -d transport -c "select 1;" | Out-Null
  Ok "DB query ok"
}

# HTTP checks
$health = "$BaseUrl/api/trips"
Ok ("Waiting backend 200 on " + $health + " ...")

if (!(Wait-Http200 -Url $health -Timeout $TimeoutSeconds)) {
  Warn "Backend not ready. Last 120 log lines:"
  docker compose logs backend --tail=120
  Fail "Backend HTTP failed"
}

Ok "Backend HTTP ok"

$endpoints = @(
  "/api/trips",
  "/api/customers",
  "/api/shipments",
  "/api/drivers",
  "/api/warehouses",
  "/api/trucks",
  "/trucks"
)

foreach ($ep in $endpoints) {
  $url = "$BaseUrl$ep"
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    Ok ("GET " + $ep + " -> " + $r.StatusCode)
  } catch {
    Warn ("GET " + $ep + " -> failed (" + $_.Exception.Message + ")")
  }
}

Ok "Smoke test done"
exit 0
