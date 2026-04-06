import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:8000/api/v1/climateAll";

/* ── Mock data (wyłącz gdy masz prawdziwe API) ─────────────── */
const generateMock = () => {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => ({
    time: now - (29 - i) * 10_000,
    temperature: +(20 + Math.sin(i / 4) * 4 + Math.random()).toFixed(1),
    humidity: +(55 + Math.cos(i / 5) * 10 + Math.random()).toFixed(1),
  }));
};

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
        <span style={{ fontSize: 11, marginLeft: 3, opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ── Single Chart Card ─────────────────────────────────────── */
function ChartCard({ title, data, dataKey, unit, color, gradientId, icon, minY, maxY, latest }) {
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
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
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
              fontSize: 42,
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
                fontSize: 16,
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

        {/* Live badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#0d1f12",
            border: "1px solid #1a3a22",
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "#22c55e",
              letterSpacing: "0.08em",
            }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#1e2a38"
              vertical={false}
            />

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
                fontSize: 10,
                fill: "#3a4a5a",
              }}
              tickLine={false}
              axisLine={false}
              minTickGap={60}
            />

            <YAxis
              domain={[minY, maxY]}
              tick={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
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
      {data.length > 0 && (
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
            { label: "MIN", val: Math.min(...data.map((d) => d[dataKey])) },
            { label: "MAX", val: Math.max(...data.map((d) => d[dataKey])) },
            {
              label: "AVG",
              val: +(data.reduce((s, d) => s + d[dataKey], 0) / data.length).toFixed(1),
            },
          ].map(({ label, val }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
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
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#8a9ab0",
                }}
              >
                {val}
                <span style={{ fontSize: 10, color: color, marginLeft: 2, opacity: 0.7 }}>
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
  const [data, setData] = useState(generateMock());

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
    } catch {
      // zostają mock dane jeśli API niedostępne
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const latest = data[data.length - 1];

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
                fontSize: 22,
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
                fontSize: 11,
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
              fontSize: 11,
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
            display: "flex",
            flexDirection: "column",
            gap: 20,
            flexWrap: "wrap",
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