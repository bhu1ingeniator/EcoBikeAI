import { useEffect, useState } from "react";
import { getJson, postJson } from "./api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import Landing, { BikeIcon } from "./Landing";
import "./App.css";

const FRIENDLY_ERROR =
  "Couldn't load data. The server may be waking up (free hosting), so please try again in a minute.";

const SOURCE_LABELS = {
  DATASET: "Dataset",
  ESTIMATED: "Estimated",
  ZERO_TAILPIPE: "Electric (zero tailpipe)",
};

const fmt = (v, unit = "") =>
  v === null || v === undefined || v === "" ? "Not in dataset" : `${v}${unit}`;

const sourceLabel = (s) => SOURCE_LABELS[s] || s || "";

const priceOf = (b) => {
  if (!b.price) return "Not in dataset";
  const symbol = b.currency === "INR" ? "₹" : "$";
  return `${symbol} ${b.price.toLocaleString()}`;
};

// One bike picker: brand -> model -> variant
function useBikePicker(region, setError, withStats) {
  const [brand, setBrand] = useState("");
  const [models, setModels] = useState([]);
  const [modelText, setModelText] = useState("");
  const [model, setModel] = useState("");
  const [variants, setVariants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBike, setLoadingBike] = useState(false);

  useEffect(() => {
    setModelText("");
    setModel("");
    setVariants([]);
    setSelected(null);
    setStats(null);
    setModels([]);
    if (!brand) return;

    let cancelled = false;
    setLoadingModels(true);
    getJson(`/bikes/models?region=${region}&brand=${encodeURIComponent(brand)}`)
      .then((m) => { if (!cancelled) setModels(m); })
      .catch(() => { if (!cancelled) setError(FRIENDLY_ERROR); })
      .finally(() => { if (!cancelled) setLoadingModels(false); });

    if (withStats) {
      getJson(`/stats/brand?region=${region}&brand=${encodeURIComponent(brand)}`)
        .then((s) => { if (!cancelled) setStats(s); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [brand, region]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelected(null);
    setVariants([]);
    if (!model) return;

    let cancelled = false;
    setLoadingBike(true);
    getJson(`/bikes?region=${region}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)
      .then((v) => {
        if (!cancelled) {
          setVariants(v);
          setSelected(v[0] ?? null);
        }
      })
      .catch(() => { if (!cancelled) setError(FRIENDLY_ERROR); })
      .finally(() => { if (!cancelled) setLoadingBike(false); });
    return () => { cancelled = true; };
  }, [model]); // eslint-disable-line react-hooks/exhaustive-deps

  function onModelInput(value) {
    setModelText(value);
    setModel(models.includes(value) ? value : "");
  }

  function onVariantChange(id) {
    setSelected(variants.find((v) => String(v.id) === id) ?? null);
  }

  return {
    brand, setBrand, models, modelText, onModelInput, loadingModels,
    variants, selected, onVariantChange, loadingBike, stats,
  };
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [region, setRegion] = useState("INDIA");
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [compareOn, setCompareOn] = useState(false);

  const main = useBikePicker(region, setError, true);
  const other = useBikePicker(region, setError, false);

  useEffect(() => {
    setAnalysis("");
    main.setBrand("");
    other.setBrand("");

    let cancelled = false;
    setLoadingBrands(true);
    getJson(`/bikes/brands?region=${region}`)
      .then((b) => {
        if (!cancelled) {
          setBrands(b);
          setError("");
        }
      })
      .catch(() => { if (!cancelled) setError(FRIENDLY_ERROR); })
      .finally(() => { if (!cancelled) setLoadingBrands(false); });
    return () => { cancelled = true; };
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAnalysis("");
  }, [main.selected?.id]);

  async function analyze() {
    if (!main.selected) return;
    setAiLoading(true);
    setAnalysis("");
    try {
      const data = await postJson("/ai/analyze", { id: main.selected.id });
      setAnalysis(data.analysis);
    } catch (e) {
      setAnalysis(`Couldn't get an analysis: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  }

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  const s = main.selected;
  const o = other.selected;

  return (
    <div className="app">
      <header>
        <div className="logo">
          <BikeIcon size={24} />
          <span className="logo-text">EcoBike<span>AI</span></span>
        </div>
        <div className="toggle">
          <button className={region === "INDIA" ? "on" : ""} onClick={() => setRegion("INDIA")}>India</button>
          <button className={region === "GLOBAL" ? "on" : ""} onClick={() => setRegion("GLOBAL")}>Global</button>
        </div>
      </header>

      {error && (
        <div className="error">
          <span>{error}</span>
          <button className="link" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <div className="layout">
        <aside className="panel">
          <p className="eyebrow">Find your bike</p>
          <PickerFields picker={main} brands={brands} loadingBrands={loadingBrands} idPrefix="main" />

          <button className="link compare-toggle" onClick={() => setCompareOn(!compareOn)}>
            {compareOn ? "Stop comparing" : "+ Compare with another bike"}
          </button>

          {compareOn && (
            <>
              <p className="eyebrow compare-title">Compare with</p>
              <PickerFields picker={other} brands={brands} loadingBrands={loadingBrands} idPrefix="other" />
            </>
          )}
        </aside>

        <main className="main">
          {main.stats && <BrandChart stats={main.stats} region={region} />}

          {main.loadingBike && (
            <div className="empty"><span className="spinner" />Loading bike details...</div>
          )}

          {!s && !main.loadingBike && (
            <div className="empty">Choose a model to see its details.</div>
          )}

          {s && !main.loadingBike && (
            <section>
              <p className="eyebrow">Selected bike</p>
              <h2 className="section-title">{s.brand} {s.model}</h2>
              <div className="cards">
                <Card label="Mileage" value={fmt(s.mileageKmpl, " km/l")} />
                <Card label="CO₂ emission" value={fmt(s.co2GKm, " g/km")} sub={sourceLabel(s.co2Source)} />
                <Card label="Engine" value={fmt(s.engineCc, " cc")} />
                <Card label="Power" value={fmt(s.powerHp, " hp")} />
                <Card label="Weight" value={fmt(s.weightKg, " kg")} />
                <Card label="Fuel tank" value={fmt(s.fuelTankL, " L")} />
                <Card label="Fuel type" value={fmt(s.fuelType)} />
                <Card label="Category" value={fmt(s.category)} />
                <Card label="Price" value={priceOf(s)} />
              </div>
            </section>
          )}

          {compareOn && s && o && <CompareTable a={s} b={o} />}
        </main>

        <aside className="panel ai">
          <p className="eyebrow">AI suggestions</p>
          <button className="cta" onClick={analyze} disabled={!s || aiLoading}>
            {aiLoading ? "Analysing..." : "Analyse this bike"}
          </button>
          <pre className="analysis">{analysis}</pre>
        </aside>
      </div>
    </div>
  );
}

function PickerFields({ picker, brands, loadingBrands, idPrefix }) {
  return (
    <>
      <label>Brand</label>
      <select
        value={picker.brand}
        disabled={loadingBrands}
        onChange={(e) => picker.setBrand(e.target.value)}
      >
        <option value="">{loadingBrands ? "Loading brands..." : "Select brand"}</option>
        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <label>Model</label>
      <input
        list={`${idPrefix}-models`}
        className="search"
        disabled={!picker.brand || picker.loadingModels}
        placeholder={
          !picker.brand ? "Choose a brand first"
            : picker.loadingModels ? "Loading models..."
            : "Type to search a model"
        }
        value={picker.modelText}
        onChange={(e) => picker.onModelInput(e.target.value)}
      />
      <datalist id={`${idPrefix}-models`}>
        {picker.models.map((m) => <option key={m} value={m} />)}
      </datalist>

      {picker.variants.length > 1 && (
        <>
          <label>Variant</label>
          <select
            value={picker.selected?.id ?? ""}
            onChange={(e) => picker.onVariantChange(e.target.value)}
          >
            {picker.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year ?? "Variant"} {v.price ? `(${v.price})` : ""}
              </option>
            ))}
          </select>
        </>
      )}
    </>
  );
}

function BrandChart({ stats, region }) {
  if (!stats) return null;
  const data = stats.models.map((m) => ({ name: m.model, co2: Number(m.co2) }));
  if (data.length === 0) {
    return (
      <div className="empty">
        No tailpipe CO₂ data for this brand. It may be electric-only.
      </div>
    );
  }
  return (
    <div className="chart-card">
      <p className="eyebrow">Brand CO₂ overview</p>
      <h3>{stats.brand}: CO₂ by model (g/km, lowest first)</h3>
      <p className="muted">
        Brand average: {stats.summary.avg_co2 ?? "n/a"} g/km across {stats.summary.models} models.
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

function CompareTable({ a, b }) {
  const rows = [
    ["Mileage", fmt(a.mileageKmpl, " km/l"), fmt(b.mileageKmpl, " km/l")],
    ["CO₂ emission", fmt(a.co2GKm, " g/km"), fmt(b.co2GKm, " g/km")],
    ["Engine", fmt(a.engineCc, " cc"), fmt(b.engineCc, " cc")],
    ["Power", fmt(a.powerHp, " hp"), fmt(b.powerHp, " hp")],
    ["Weight", fmt(a.weightKg, " kg"), fmt(b.weightKg, " kg")],
    ["Fuel tank", fmt(a.fuelTankL, " L"), fmt(b.fuelTankL, " L")],
    ["Fuel type", fmt(a.fuelType), fmt(b.fuelType)],
    ["Category", fmt(a.category), fmt(b.category)],
    ["Price", priceOf(a), priceOf(b)],
  ];
  return (
    <div className="chart-card">
      <p className="eyebrow">Side by side</p>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th></th>
              <th>{a.brand} {a.model}</th>
              <th>{b.brand} {b.model}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, x, y]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{x}</td>
                <td>{y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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