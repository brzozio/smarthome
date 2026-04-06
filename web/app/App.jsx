import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://192.168.1.154:8000/api/v1/climateAll";

/* ── Custom Tooltip ────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(10,14,20,0.92)",
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 6,
        padding: "8px 14px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#687080", marginBottom: 4 }}>
        {new Date(label).toLocaleTimeString("pl-PL")}
      </div>
      <div style={{ color, fontWeight: 700, fontSize: 16 }}>
        {payload[0].value}
        <span style={{ fontSize: 15, marginLeft: 3, opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ── Single Chart Card ─────────────────────────────────────── */
function ChartCard({ title, data, dataKey, unit, color, gradientId, icon, minY, maxY, latest }) {

  const stats = useMemo(() => {
    if (!data.length) return null;

    return {
      min: Math.min(...data.map((d) => d[dataKey])),
      max: Math.max(...data.map((d) => d[dataKey])),
      avg: +(data.reduce((s, d) => s + d[dataKey], 0) / data.length).toFixed(1),
    };
  }, [data, dataKey]);

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0d1117 0%, #111820 100%)",
        border: "1px solid #1e2a38",
        borderRadius: 16,
        padding: "28px 24px 20px",
        flex: 1,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 35 }}>{icon}</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 25,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#4a5568",
              }}
            >
              {title}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 60,
              fontWeight: 700,
              color: "#e8edf5",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {latest ?? "—"}
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 35,
                fontWeight: 400,
                color: color,
                marginLeft: 6,
                opacity: 0.85,
              }}
            >
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 4" stroke="#1e2a38" vertical={false} />

            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(t) =>
                new Date(t).toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              }
              tick={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 25,
                fill: "#3a4a5a",
              }}
              tickLine={false}
              axisLine={false}
              minTickGap={60}
            />

            <YAxis
              domain={[
                (dataMin) => Math.floor(dataMin - 1),
                (dataMax) => Math.ceil(dataMax + 1),
              ]}
              tick={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 25,
                fill: "#3a4a5a",
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={<CustomTooltip unit={unit} color={color} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.3 }}
            />

            <Area
              type="monotoneX"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: "#0d1117",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats */}
      {stats && (
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #1a2432",
          }}
        >
          {[
            { label: "MIN", val: stats.min },
            { label: "MAX", val: stats.max },
            { label: "AVG", val: stats.avg },
          ].map(({ label, val }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 14,
                  letterSpacing: "0.1em",
                  color: "#3a4a5a",
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 25,
                  fontWeight: 600,
                  color: "#8a9ab0",
                }}
              >
                {val}
                <span style={{ fontSize: 25, color: color, marginLeft: 2, opacity: 0.7 }}>
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();

      const formatted = json
        .map((item) => ({
          time: new Date(item.created_at).getTime(),
          temperature: item.temperature,
          humidity: item.humidity,
        }))
        .sort((a, b) => a.time - b.time);

      setData(formatted);
    } catch {}
  }, []);

  useEffect(() => {
    let alive = true;

    const loop = async () => {
      while (alive) {
        await fetchData();
        await new Promise((r) => setTimeout(r, 5000));
      }
    };

    loop();

    return () => {
      alive = false;
    };
  }, [fetchData]);

  const latest = data[data.length - 1];

  if (!data.length) {
    return (
      <div style={{ color: "#3a4a5a", padding: 20 }}>
        Brak danych z API
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Space+Grotesk:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c10; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#080c10",
          padding: "36px 24px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#c8d4e0",
                letterSpacing: "-0.02em",
              }}
            >
              Climate Monitor
            </h1>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 25,
                color: "#3a4a5a",
                marginTop: 3,
                letterSpacing: "0.05em",
              }}
            >
              {data.length} próbek · odświeżanie co 5s
            </p>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 25,
              color: "#3a4a5a",
            }}
          >
            {latest
              ? new Date(latest.time).toLocaleString("pl-PL")
              : "—"}
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            minHeight: 0,
            height: "calc(100vh - 140px)",
          }}
        >
          <ChartCard
            title="Temperatura"
            data={data}
            dataKey="temperature"
            unit="°C"
            color="#f97316"
            gradientId="gradTemp"
            icon="🌡"
            minY="auto"
            maxY="auto"
            latest={latest?.temperature}
          />
          <ChartCard
            title="Wilgotność"
            data={data}
            dataKey="humidity"
            unit="%"
            color="#38bdf8"
            gradientId="gradHum"
            icon="💧"
            minY="auto"
            maxY="auto"
            latest={latest?.humidity}
          />
        </div>
      </div>
    </>
  );
}