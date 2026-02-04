import Trips from "./pages/Trips";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
const [page, setPage] = useState<"dashboard" | "trips">("dashboard");
const [selectedShipmentId, setSelectedShipmentId] = useState("");
const [allocCount, setAllocCount] = useState(1);
async function apiGet(path) {
  const res = await fetch(path);
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : null;
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : null;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId),
    [trips, selectedTripId]
  );

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const [t, s] = await Promise.all([apiGet("/api/trips"), apiGet("/api/shipments")]);
      setTrips(Array.isArray(t) ? t : []);
      setShipments(Array.isArray(s) ? s : []);
      if (!selectedTripId && Array.isArray(t) && t.length) setSelectedTripId(t[0].id);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
if (!selectedShipmentId && Array.isArray(s) && s.length) setSelectedShipmentId(s[0].id);

  async function doLoad(tripShipmentId, n) {
    setErr("");
    try {
      await apiPost("/api/trip-shipments/load", { tripShipmentId, palletsLoaded: n });
      await refresh();setShipments(Array.isArray(s) ? s : []);

    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function doDeliver(tripShipmentId, n) {
    setErr("");
    try {
      await apiPost("/api/trip-shipments/deliver", { tripShipmentId, palletsDelivered: n });
      await refresh();
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h2>Transport Dashboard (MVP)</h2>

      {err ? (
        <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <b>Грешка:</b> {err}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button onClick={refresh} disabled={loading} style={{ padding: "8px 12px" }}>
          Refresh
        </button>

        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Избери курс</div>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            style={{ padding: 8, minWidth: 420 }}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id.slice(0, 8)} — Truck: {t.truck?.plate || "?"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Курс (Trips)</h3>

          {loading ? <div>Зареждане...</div> : null}

          {!loading && !selectedTrip ? (
            <div>Няма курс. (Създай курс от backend-а.)</div>
          ) : null}

          {selectedTrip ? (
            <div>
              <div style={{ marginBottom: 8 }}>
                <b>Truck:</b> {selectedTrip.truck?.plate || "?"} <br />
                <b>Trip ID:</b> {selectedTrip.id}
              </div>
<div style={{ marginTop: 12, border: "1px dashed #ccc", borderRadius: 10, padding: 10 }}>
  <h4 style={{ marginTop: 0 }}>Allocate палети към този курс</h4>

  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <select
      value={selectedShipmentId}
      onChange={(e) => setSelectedShipmentId(e.target.value)}
      style={{ padding: 8, minWidth: 260 }}
    >
      {shipments.map((s) => (
        <option key={s.id} value={s.id}>
          {s.refNo} ({s.customer?.name})
        </option>
      ))}
    </select>

    <input
      type="number"
      min={1}
      value={allocCount}
      onChange={(e) => setAllocCount(Number(e.target.value))}
      style={{ padding: 8, width: 90 }}
    />

    <button
      onClick={() => doAllocate(selectedTrip.id, selectedShipmentId, allocCount)}
      style={{ padding: "8px 12px" }}
      disabled={!selectedTrip || !selectedShipmentId || !allocCount}
    >
      Allocate
    </button>
  </div>

  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
    Първо Allocate, после Load/Deliver.
  </div>
</div>

              <h4>Пратки в курса (TripShipments)</h4>

              {(!selectedTrip.shipments || selectedTrip.shipments.length === 0) ? (
                <div>Няма резервирани пратки към този курс.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedTrip.shipments.map((ts) => (
                    <div key={ts.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>TripShipment ID: {ts.id}</div>
                      <div>
                        <b>Shipment:</b> {ts.shipment?.refNo || ts.shipmentId}
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
                        <span><b>Allocated:</b> {ts.palletsAllocated}</span>
                        <span><b>Loaded:</b> {ts.palletsLoaded}</span>
                        <span><b>Delivered:</b> {ts.palletsDelivered}</span>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button onClick={() => doLoad(ts.id, 1)} style={{ padding: "6px 10px" }}>Load +1</button>
                        <button onClick={() => doLoad(ts.id, 5)} style={{ padding: "6px 10px" }}>Load +5</button>

                        <button onClick={() => doDeliver(ts.id, 1)} style={{ padding: "6px 10px" }}>Deliver +1</button>
                        <button onClick={() => doDeliver(ts.id, 3)} style={{ padding: "6px 10px" }}>Deliver +3</button>
                      </div>
async function doAllocate(tripId, shipmentId, palletsAllocated) {
  setErr("");
  try {
    await apiPost("/api/trip-shipments", { tripId, shipmentId, palletsAllocated });
    await refresh();
  } catch (e) {
    setErr(String(e?.message || e));
  }
}


                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                        * Ако бутон даде грешка, значи backend endpoint-ът липсва или правилото е нарушено (deliver &gt; loaded, load &gt; allocated).
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Пратки (Shipments)</h3>

          {loading ? <div>Зареждане...</div> : null}

          {!loading && shipments.length === 0 ? <div>Няма пратки.</div> : null}

          {!loading && shipments.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {shipments.map((s) => (
                <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                  <div>
                    <b>{s.refNo}</b> — {s.customer?.name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Склад: {s.warehouse?.code} | Статус: <b>{s.metrics?.status}</b>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
                    <span><b>Total:</b> {s.metrics?.total}</span>
                    <span><b>Available:</b> {s.metrics?.available}</span>
                    <span><b>Allocated:</b> {s.metrics?.allocated}</span>
                    <span><b>Loaded:</b> {s.metrics?.loaded}</span>
                    <span><b>Delivered:</b> {s.metrics?.delivered}</span>
                    <span><b>InTransit:</b> {s.metrics?.inTransit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Ако виждаш CORS грешка: proxy-то във vite.config.js трябва да е запазено и Vite да е рестартиран.
      </div>
    </div>
  );
}
