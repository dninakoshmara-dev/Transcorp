import React, { useEffect, useMemo, useState } from "react";

type DashboardProgress = {
  shipmentsTotal: number;
  shipmentsDone: number;
  tripsTotal: number;
  tripsInProgress: number;
};

type ProgressResponse = {
  status?: string;
  progress?: DashboardProgress;
};

type TripRow = {
  id?: string;
  status?: string; // e.g. IN_PROGRESS, COMPLETED, etc
  allocated?: number;
  loaded?: number;
  delivered?: number;
  remaining?: number;
  createdAt?: string;
  completedAt?: string | null;
};

type TripsResponse = {
  status?: string;
  trips?: TripRow[];
};

// Ако имаш Vite proxy (примерно /api), можеш да сложиш API_BASE = "".
// По твоите тестове бекендът е на localhost:3001:
const API_BASE = "http://localhost:3001";

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  // Nest често връща JSON и при 404/500. Все пак пазим.
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // не е JSON
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `HTTP ${res.status} при ${url}`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data as T;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [progress, setProgress] = useState<DashboardProgress | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [onlyInProgress, setOnlyInProgress] = useState(false);

  const allocated = progress?.shipmentsTotal ?? 0;
  const delivered = progress?.shipmentsDone ?? 0;
  const remaining = Math.max(allocated - delivered, 0);

  // FIX: никога undefined%
  const deliveredPct =
    allocated > 0 ? Math.round((delivered / allocated) * 100) : 0;

  const tripsInProgress = progress?.tripsInProgress ?? 0;
  const tripsTotal = progress?.tripsTotal ?? 0;

  const filteredTrips = useMemo(() => {
    if (!onlyInProgress) return trips;
    return trips.filter((t) => (t.status || "").toUpperCase() === "IN_PROGRESS");
  }, [onlyInProgress, trips]);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const p = await fetchJson<ProgressResponse>(
        `${API_BASE}/api/dashboard/progress`
      );
      setProgress(p.progress ?? null);

      const t = await fetchJson<TripsResponse>(
        `${API_BASE}/api/dashboard/progress/trips`
      );
      setTrips(Array.isArray(t.trips) ? t.trips : []);
    } catch (e: any) {
      setErr(e?.message ?? "Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button
          onClick={loadAll}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 8,
            cursor: "pointer",
            background: "white",
          }}
          disabled={loading}
          title="Презареди данните"
        >
          Refresh
        </button>

        <label style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input
            type="checkbox"
            checked={onlyInProgress}
            onChange={(e) => setOnlyInProgress(e.target.checked)}
          />
          Only IN_PROGRESS
        </label>
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ffaaaa",
            background: "#fff0f0",
            borderRadius: 8,
          }}
        >
          <b>Грешка:</b> {err}
          <div style={{ marginTop: 8 }}>
            Провери дали backend-а работи на {API_BASE} и дали CORS е ок.
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <StatCard title="Allocated" value={allocated} />
        <StatCard title="Loaded" value={progress?.shipmentsDone ?? 0 /* ако нямаш loaded отделно */} />
        <StatCard title="Delivered" value={delivered} />
        <StatCard title="Delivered %" value={`${deliveredPct}%`} />
        <StatCard title="Remaining" value={remaining} />
        <StatCard title="Trips (IN_PROGRESS / Total)" value={`${tripsInProgress} / ${tripsTotal}`} />
      </div>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>Trips</h2>

      {loading ? (
        <div style={{ padding: 12 }}>Зареждане...</div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <Th>Trip</Th>
                <Th>Status</Th>
                <Th>Allocated</Th>
                <Th>Loaded</Th>
                <Th>Delivered</Th>
                <Th>Remaining</Th>
                <Th>Action</Th>
                <Th>Created</Th>
                <Th>Completed</Th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 12, textAlign: "center" }}>
                    Няма записи
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t, idx) => {
                  const a = t.allocated ?? 0;
                  const l = t.loaded ?? 0;
                  const d = t.delivered ?? 0;
                  const r =
                    t.remaining ??
                    Math.max(a - d, 0);

                  return (
                    <tr key={t.id ?? idx} style={{ borderTop: "1px solid #eee" }}>
                      <Td>{t.id ?? "-"}</Td>
                      <Td>{t.status ?? "-"}</Td>
                      <Td>{a}</Td>
                      <Td>{l}</Td>
                      <Td>{d}</Td>
                      <Td>{r}</Td>
                      <Td>
                        {/* Тук можеш да вържеш бутони към твоите endpoints */}
                        <span style={{ color: "#888" }}>-</span>
                      </Td>
                      <Td>{formatDate(t.createdAt)}</Td>
                      <Td>{formatDate(t.completedAt)}</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        API: <code>{API_BASE}/api/dashboard/progress</code> и{" "}
        <code>{API_BASE}/api/dashboard/progress/trips</code>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 12,
        background: "white",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: 10, fontSize: 12, color: "#555" }}>
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: 10, fontSize: 13 }}>{children}</td>;
}
