$ErrorActionPreference = "Stop"

$BASE = "http://localhost:3001"
$truckId = "cmkygvs3q0001pa46oma4gt4h"
$warehouseId = "36344d17-a328-4383-b05e-495fbece3926"
$customerId = "cmkyh7qdx0004pa46y6lyjne8"

function PostJson($url, $obj) {
  Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body ($obj | ConvertTo-Json -Depth 10)
}

Write-Host "1) Create Trip..."
$trip = PostJson "$BASE/api/trips" @{
  truckId = $truckId
  startWarehouseId = $warehouseId
}
$TRIP_ID = $trip.id
Write-Host "TRIP_ID = $TRIP_ID"

Write-Host "2) Trip -> IN_PROGRESS..."
$trip2 = PostJson "$BASE/api/trips/status" @{
  tripId = $TRIP_ID
  status = "IN_PROGRESS"
}
Write-Host "Trip status = $($trip2.status)"

Write-Host "3) Create Shipment..."
$refNo = "REF-PS-" + (Get-Date -Format "HHmmss")
$shipment = PostJson "$BASE/api/shipments" @{
  refNo = $refNo
  palletsTotal = 10
  weightKg = 600
  customerId = $customerId
  warehouseId = $warehouseId
}
$SHIP_ID = $shipment.id
Write-Host "SHIP_ID = $SHIP_ID (refNo=$refNo)"

Write-Host "4) Attach Shipment to Trip..."
$tripShipment = PostJson "$BASE/api/trip-shipments" @{
  tripId = $TRIP_ID
  shipmentId = $SHIP_ID
  palletsAllocated = 10
}
$TRIP_SHIP_ID = $tripShipment.id
Write-Host "TRIP_SHIP_ID = $TRIP_SHIP_ID"

Write-Host "5) Load pallets..."
$loaded = PostJson "$BASE/api/trip-shipments/load" @{
  tripShipmentId = $TRIP_SHIP_ID
  palletsLoaded = 10
}
Write-Host "Loaded = $($loaded.palletsLoaded)/$($loaded.palletsAllocated)"

Write-Host "6) Deliver pallets..."
$delivered = PostJson "$BASE/api/trip-shipments/deliver" @{
  tripShipmentId = $TRIP_SHIP_ID
  palletsDelivered = 10
}
Write-Host "Delivered = $($delivered.palletsDelivered)/$($delivered.palletsAllocated)"

Write-Host "7) Trip -> COMPLETED..."
$tripDone = PostJson "$BASE/api/trips/status" @{
  tripId = $TRIP_ID
  status = "COMPLETED"
}
Write-Host "Trip final status = $($tripDone.status)"
Write-Host "`nDONE ✅"
