import { useEffect, useState } from "react";
import { getJson, postJson } from "./api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import "./App.css";

const fmt = (v, unit = "") => (v === null || v === undefined ? "N/A" : `${v}${unit}`);

export default function App() {
  const [started, setStarted] = useState(false);
  const [region, setRegion] = useState("INDIA");
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [models, setModels] = useState([]);
  const [modelText, setModelText] = useState("");
  const [model, setModel] = useState("");
  const [variants, setVariants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  // Region changed: reload brands and clear everything below
  useEffect(() => {
    setBrand(""); setModels([]); setModelText(""); setModel("");
    setVariants([]); setSelected(null); setStats(null); setAnalysis("");
    getJson(`/bikes/brands?region=${region}`).then(setBrands).catch((e) => setError(e.message));
  }, [region]);

  // Brand changed: load its models and its chart stats
  useEffect(() => {
    setModelText(""); setModel(""); setVariants([]); setSelected(null); setAnalysis("");
    setStats(null);
    if (!brand) { setModels([]); return; }
    getJson(`/bikes/models?region=${region}&brand=${encodeURIComponent(brand)}`)
      .then(setModels).catch((e) => setError(e.message));
    getJson(`/stats/brand?region=${region}&brand=${encodeURIComponent(brand)}`)
      .then(setStats).catch((e) => setError(e.message));
  }, [brand]);

  // Model chosen: load its variants and pick the first one
  useEffect(() => {
    setSelected(null); setAnalysis("");
    if (!model) { setVariants([]); return; }
    getJson(`/bikes?region=${region}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)
      .then((v) => { setVariants(v); setSelected(v[0] ?? null); })
      .catch((e) => setError(e.message));
  }, [model]);

  async function analyze() {
    if (!selected) return;
    setAiLoading(true); setAnalysis("");
    try {
      const data = await postJson("/ai/analyze", { id: selected.id });
      setAnalysis(data.analysis);
    } catch (e) {
      setAnalysis("Error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  }

  if (!started) {
    return (
      <div className="landing">
        <h1>EcoBike <span>AI</span></h1>
        <p>Explore bike brands and models, compare mileage and CO₂ emissions, and get AI-driven insights for smarter, cleaner commuting.</p>
        <button className="cta" onClick={() => setStarted(true)}>Get Started</button>
      </div>
    );
  }

  const priceText = selected?.price
    ? `${selected.currency === "INR" ? "₹" : "$"} ${selected.price.toLocaleString()}`
    : "N/A";

  return (
    <div className="app">
      <header>
        <div className="logo">EcoBike<span>AI</span></div>
        <div className="toggle">
          <button className={region === "INDIA" ? "on" : ""} onClick={() => setRegion("INDIA")}>India</button>
          <button className={region === "GLOBAL" ? "on" : ""} onClick={() => setRegion("GLOBAL")}>Global</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="layout">
        <aside className="panel">
          <h3>Find your bike</h3>

          <label>Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Select brand</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <label>Model</label>
          <input
            list="model-list"
            className="search"
            disabled={!brand}
            placeholder={brand ? "Type to search a model" : "Choose a brand first"}
            value={modelText}
            onChange={(e) => {
              const v = e.target.value;
              setModelText(v);
              if (models.includes(v)) setModel(v);
              else setModel("");
            }}
          />
          <datalist id="model-list">
            {models.map((m) => <option key={m} value={m} />)}
          </datalist>

          {variants.length > 1 && (
            <>
              <label>Variant</label>
              <select
                value={selected?.id ?? ""}
                onChange={(e) => setSelected(variants.find((v) => String(v.id) === e.target.value))}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.year ?? "Variant"} {v.price ? `(${v.price})` : ""}</option>
                ))}
              </select>
            </>
          )}
        </aside>

        <main className="main">
          <BrandChart stats={stats} region={region} />

          {!selected && <div className="empty">Choose a model to see its details.</div>}
          {selected && (
            <>
              <h2>{selected.brand} {selected.model}</h2>
              <div className="cards">
                <Card label="Mileage" value={fmt(selected.mileageKmpl, " km/l")} />
                <Card label="CO₂ emission" value={fmt(selected.co2GKm, " g/km")} sub={selected.co2Source} />
                <Card label="Engine" value={fmt(selected.engineCc, " cc")} />
                <Card label="Power" value={fmt(selected.powerHp, " hp")} />
                <Card label="Weight" value={fmt(selected.weightKg, " kg")} />
                <Card label="Fuel tank" value={fmt(selected.fuelTankL, " L")} />
                <Card label="Fuel type" value={fmt(selected.fuelType)} />
                <Card label="Category" value={fmt(selected.category)} />
                <Card label="Price" value={priceText} />
              </div>
            </>
          )}
        </main>

        <aside className="panel ai">
          <h3>AI suggestions</h3>
          <button className="cta" onClick={analyze} disabled={!selected || aiLoading}>
            {aiLoading ? "Analysing..." : "Analyse this bike"}
          </button>
          <pre className="analysis">{analysis}</pre>
        </aside>
      </div>
    </div>
  );
}

function BrandChart({ stats, region }) {
  if (!stats) return null;
  const data = stats.models.map((m) => ({
    name: m.model,
    co2: Number(m.co2),
  }));
  if (data.length === 0) {
    return <div className="empty">No CO₂ data for this brand.</div>;
  }
  return (
    <div className="chart-card">
      <h3>{stats.brand}: CO₂ by model (g/km, lowest first)</h3>
      <p className="muted">
        Brand average: {stats.summary.avg_co2} g/km across {stats.summary.models} models.
        {region === "INDIA" && " India CO₂ values are estimated from mileage."}
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            angle={-35}
            textAnchor="end"
            height={90}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
          <Bar dataKey="co2" fill="#22c55e" name="CO₂ (g/km)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Card({ label, value, sub }) {
  return (
    <div className="card">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}