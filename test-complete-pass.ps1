$ErrorActionPreference="Stop"
$BASE="http://localhost:3001"
$truckId="cmkygvs3q0001pa46oma4gt4h"
$warehouseId="36344d17-a328-4383-b05e-495fbece3926"
$customerId="cmkyh7qdx0004pa46y6lyjne8"

function Post($url,$obj){
  Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body ($obj|ConvertTo-Json -Depth 10)
}

Write-Host "1) Create Trip..."
$trip = Post "$BASE/api/trips" @{truckId=$truckId; startWarehouseId=$warehouseId}
$tripId = $trip.id
Write-Host "TRIP_ID = $tripId"

Write-Host "2) Trip -> IN_PROGRESS..."
Post "$BASE/api/trips/status" @{tripId=$tripId; status="IN_PROGRESS"} | Out-Null

Write-Host "3) Create Shipment..."
$refNo = "REF-PASS-" + (Get-Date -Format "HHmmss")
$ship = Post "$BASE/api/shipments" @{refNo=$refNo; palletsTotal=10; weightKg=200; customerId=$customerId; warehouseId=$warehouseId}
$shipId = $ship.id
Write-Host "SHIP_ID = $shipId (refNo=$refNo)"

Write-Host "4) Attach Shipment -> TripShipment..."
$ts = Post "$BASE/api/trip-shipments" @{tripId=$tripId; shipmentId=$shipId; palletsAllocated=10}
$tsId = $ts.id
Write-Host "TRIP_SHIPMENT_ID = $tsId"

Write-Host "5) Load 10..."
$loaded = Post "$BASE/api/trip-shipments/load" @{tripShipmentId=$tsId; palletsLoaded=10}
Write-Host "Loaded = $($loaded.palletsLoaded)/$($loaded.palletsAllocated)"

Write-Host "6) Deliver 10..."
$delivered = Post "$BASE/api/trip-shipments/deliver" @{tripShipmentId=$tsId; palletsDelivered=10}
Write-Host "Delivered = $($delivered.palletsDelivered)/$($delivered.palletsAllocated)"

Write-Host "7) Trip -> COMPLETED (should succeed)..."
$done = Post "$BASE/api/trips/status" @{tripId=$tripId; status="COMPLETED"}
Write-Host "Trip final status = $($done.status)"
Write-Host "DONE OK"
