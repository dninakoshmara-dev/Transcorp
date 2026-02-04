import { useEffect, useState } from "react";
import { apiGet } from "../api";

type Trip = {
  id: string;
  status: string;
  truckId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any[]>("/trips")
      .then((data) => {
        const mapped: Trip[] = data.map((t) => ({
          id: t.id,
          status: t.status,
          truckId: t.truckId ?? null,
          createdAt: t.createdAt,
          startedAt: t.startedAt ?? null,
          completedAt: t.completedAt ?? null,
        }));
        setTrips(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Trips</h1>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {!loading && !error && (
        <table
          style={{
            width: "100%",
            background: "white",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#e5e7eb" }}>
              <th style={{ padding: 8, textAlign: "left" }}>Trip ID</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Truck</th>
              <th style={{ padding: 8 }}>Created</th>
              <th style={{ padding: 8 }}>Started</th>
              <th style={{ padding: 8 }}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 8, fontFamily: "monospace" }}>{t.id}</td>
                <td style={{ padding: 8, textAlign: "center" }}>{t.status}</td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  {t.truckId ?? "-"}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  {t.startedAt ? new Date(t.startedAt).toLocaleString() : "-"}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  {t.completedAt ? new Date(t.completedAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
