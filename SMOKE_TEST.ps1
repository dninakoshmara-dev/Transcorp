param(
  [string]$BaseUrl = "http://127.0.0.1:3001",
  [switch]$StartStack,
  [switch]$Seed,
  [int]$WaitSeconds = 30
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::Expect100Continue = $false

function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red; exit 1 }

function Wait-Health([int]$maxSeconds) {
  $healthUrl = "$BaseUrl/api/health"
  Info "Waiting for health: $healthUrl (max ${maxSeconds}s)"

  $deadline = (Get-Date).AddSeconds($maxSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-RestMethod -Method Get -Uri $healthUrl -TimeoutSec 2
      if ($r.ok -eq $true) {
        Ok "Health is OK"
        return
      }
    } catch {
      # keep retrying
    }

    Start-Sleep -Seconds 1
  }

  Fail "Health did not become OK within ${maxSeconds}s"
}

function Login([string]$email, [string]$password) {
  $body = @{
    email = $email
    password = $password
  } | ConvertTo-Json -Compress

  try {
    $resp = Invoke-RestMethod `
      -Method Post `
      -Uri "$BaseUrl/api/auth/login" `
      -ContentType "application/json" `
      -Body $body `
      -TimeoutSec 10

    if (-not $resp.access_token) {
      Fail "Login response missing access_token for $email"
    }

    return [string]$resp.access_token
  } catch {
    $m = $_.ErrorDetails.Message
    if (-not $m) {
      $m = $_.Exception.Message
    }

    Fail "Login failed for ${email}: $m"
  }
}

function Expect-Status([int]$expected, [scriptblock]$action, [string]$label) {
  try {
    & $action | Out-Null

    if ($expected -ge 200 -and $expected -lt 300) {
      Ok "$label -> expected ${expected} and succeeded"
      return
    }

    Fail "$label -> expected HTTP ${expected} but succeeded"
  } catch {
    $status = $null

    try {
      $status = [int]$_.Exception.Response.StatusCode
    } catch {
      $status = $null
    }

    if ($status -eq $expected) {
      Ok "$label -> got HTTP $status as expected"
      return
    }

    $msg = $_.ErrorDetails.Message
    if (-not $msg) {
      $msg = $_.Exception.Message
    }

    Fail "$label -> expected HTTP ${expected} but got ${status}. Details: $msg"
  }
}

if ($StartStack -or $Seed) {
  try {
    docker compose version | Out-Null
  } catch {
    Fail "Missing command: docker compose"
  }
}

if ($StartStack) {
  Info "Starting stack: docker compose up -d"
  docker compose up -d | Out-Null
}

if ($Seed) {
  Info "Running seed: docker compose --profile tools run --rm seed"
  docker compose --profile tools run --rm seed
}

Wait-Health -maxSeconds $WaitSeconds

Info "Logging in as ADMIN and DISPATCHER"

$adminToken = Login "admin@example.com" "Admin123!"
$userToken  = Login "user@test.com" "User123!"

Ok "adminTokenLen=$($adminToken.Length)"
Ok "userTokenLen=$($userToken.Length)"

$adminHeaders = @{
  Authorization = "Bearer $adminToken"
}

$userHeaders = @{
  Authorization = "Bearer $userToken"
}

Info "Checking JWT-only read endpoints"

Expect-Status 200 {
  Invoke-RestMethod `
    -Method Get `
    -Uri "$BaseUrl/api/dashboard" `
    -Headers $userHeaders `
    -TimeoutSec 10
} "USER GET /api/dashboard"

Info "RBAC checks: USER should be 403 on write endpoints"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/warehouses" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/warehouses"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trucks" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/trucks"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/customers" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/customers"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/shipments" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/shipments"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trips" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/trips"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trip-shipments" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/trip-shipments"

Expect-Status 403 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trip-expenses" -Headers $userHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "USER POST /api/trip-expenses"

Info "RBAC checks: ADMIN should reach validation 400 on write endpoints with empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/warehouses" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/warehouses empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trucks" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/trucks empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/customers" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/customers empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/shipments" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/shipments empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trips" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/trips empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trip-shipments" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/trip-shipments empty body"

Expect-Status 400 {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/trip-expenses" -Headers $adminHeaders -ContentType "application/json" -Body "{}" -TimeoutSec 10
} "ADMIN POST /api/trip-expenses empty body"

Info "Trip-expenses query requirement: tripId required"

Expect-Status 400 {
  Invoke-RestMethod `
    -Method Get `
    -Uri "$BaseUrl/api/trip-expenses" `
    -Headers $adminHeaders `
    -TimeoutSec 10
} "ADMIN GET /api/trip-expenses without tripId"

Info "Fetch trips and list trip-expenses for first trip"

try {
  $trips = Invoke-RestMethod `
    -Method Get `
    -Uri "$BaseUrl/api/trips" `
    -Headers $adminHeaders `
    -TimeoutSec 10

  $tripId = $null

  if ($trips -is [array]) {
    if ($trips.Count -gt 0) {
      $tripId = $trips[0].id
    }
  } elseif ($trips.items -and $trips.items.Count -gt 0) {
    $tripId = $trips.items[0].id
  } elseif ($trips.data -and $trips.data.Count -gt 0) {
    $tripId = $trips.data[0].id
  } elseif ($trips.id) {
    $tripId = $trips.id
  }

  if ($tripId) {
    Expect-Status 200 {
      Invoke-RestMethod `
        -Method Get `
        -Uri "$BaseUrl/api/trip-expenses?tripId=$tripId" `
        -Headers $adminHeaders `
        -TimeoutSec 10
    } "ADMIN GET /api/trip-expenses?tripId=$tripId"
  } else {
    Warn "No trip id found; skipping trip-expenses by tripId check"
  }
} catch {
  $msg = $_.ErrorDetails.Message
  if (-not $msg) {
    $msg = $_.Exception.Message
  }

  Warn "Could not fetch trips; skipping trip-expenses by tripId check. Details: $msg"
}

Ok "SMOKE TEST PASSED"
exit 0