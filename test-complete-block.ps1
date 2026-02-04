$ErrorActionPreference="Stop"
$BASE="http://localhost:3001"
$truckId="cmkygvs3q0001pa46oma4gt4h"
$warehouseId="36344d17-a328-4383-b05e-495fbece3926"
$customerId="cmkyh7qdx0004pa46y6lyjne8"

function Post($url,$obj){
  Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body ($obj|ConvertTo-Json -Depth 10)
}

$trip = Post "$BASE/api/trips" @{truckId=$truckId; startWarehouseId=$warehouseId}
$tripId = $trip.id
Post "$BASE/api/trips/status" @{tripId=$tripId; status="IN_PROGRESS"} | Out-Null

$ship = Post "$BASE/api/shipments" @{refNo=("REF-BLOCK-" + (Get-Date -Format "HHmmss")); palletsTotal=10; weightKg=100; customerId=$customerId; warehouseId=$warehouseId}
Post "$BASE/api/trip-shipments" @{tripId=$tripId; shipmentId=$ship.id; palletsAllocated=10} | Out-Null

try {
  Post "$BASE/api/trips/status" @{tripId=$tripId; status="COMPLETED"} | Out-Null
  Write-Host "UNEXPECTED: COMPLETED succeeded"
} catch {
  Write-Host ("EXPECTED FAIL: " + $_.Exception.Message)
}
