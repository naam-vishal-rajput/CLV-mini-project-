import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import {
  Activity,
  Bot,
  Check,
  ChevronDown,
  CloudUpload,
  Crown,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLV Intelligence | Prediction Dashboard" },
      { name: "description", content: "Train, compare, and deploy customer lifetime value prediction models." },
      { property: "og:title", content: "CLV Intelligence Dashboard" },
      { property: "og:description", content: "Customer lifetime value modeling and forecasting workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const frequencyData = [
  { bracket: "1", customers: 1240 }, { bracket: "2", customers: 980 },
  { bracket: "3–5", customers: 1560 }, { bracket: "6–10", customers: 1080 },
  { bracket: "11–20", customers: 620 }, { bracket: "20+", customers: 330 },
];

const monetaryData = [
  { range: "$0–1k", current: 820, projected: 340 }, { range: "$1–5k", current: 1160, projected: 490 },
  { range: "$5–10k", current: 680, projected: 420 }, { range: "$10–25k", current: 350, projected: 310 },
  { range: "$25k+", current: 140, projected: 190 },
];

const actualValues = [18, 27, 35, 43, 52, 61, 70, 78, 87, 96, 106, 116];
const scatterSeries = {
  linear: actualValues.map((actual, i) => ({ actual, predicted: actual + ([-10, 8, -7, 9, -5, 10, -9, 8, -6, 9, -7, 11][i] ?? 0) })),
  forest: actualValues.map((actual, i) => ({ actual, predicted: actual + ([7, -5, 6, -4, 5, -6, 5, -4, 6, -5, 5, -6][i] ?? 0) })),
  xgboost: actualValues.map((actual, i) => ({ actual, predicted: actual + ([-2, 3, -2, 2, -1, 3, -2, 2, -2, 2, -1, 2][i] ?? 0) })),
};
const idealLine = [{ actual: 10, predicted: 10 }, { actual: 125, predicted: 125 }];
const segmentData = [
  { segment: "VIP", clv: 120, error: 9 }, { segment: "High-Value", clv: 85, error: 7 },
  { segment: "Steady", clv: 55, error: 5 }, { segment: "Churn Risk", clv: 15, error: 3 },
];
const driverData = [
  { name: "Recency", value: 40, color: "var(--chart-green)" },
  { name: "Frequency", value: 35, color: "var(--chart-cyan)" },
  { name: "Monetary value", value: 25, color: "var(--chart-purple)" },
];
const forecastData = [
  { month: "Apr", history: 8 }, { month: "May", history: 11 }, { month: "Jun", history: 10 },
  { month: "Jul", history: 15, forecast: 15 }, { month: "Aug", forecast: 19 },
  { month: "Sep", forecast: 24 }, { month: "Oct", forecast: 29 },
];

const chartTheme = {
  grid: "var(--chart-grid)", tick: "var(--muted-foreground)",
  tooltip: { backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--foreground)" },
};

type SliderProps = { label: string; min: number; max: number; step?: number; initial: number };

function ParameterSlider({ label, min, max, step = 1, initial }: SliderProps) {
  const [value, setValue] = useState(initial);
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{label}</span><span className="font-mono text-foreground">{value}</span>
      </span>
      <input aria-label={label} className="range-input w-full" type="range" min={min} max={max} step={step} value={value}
        style={{ "--range-progress": `${progress}%` } as React.CSSProperties} onChange={(event) => setValue(Number(event.target.value))} />
    </label>
  );
}

function SectionHeading({ index, title, icon: Icon }: { index: string; title: string; icon: typeof Activity }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex size-7 items-center justify-center rounded-md border border-primary/25 bg-primary/10 font-mono text-[11px] font-bold text-primary">{index}</span>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">{title}</h2>
      <Icon className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function ModelCard({ type, retraining, onRetrain }: { type: "linear" | "forest" | "xgboost"; retraining: string | null; onRetrain: (name: string) => void }) {
  const isBest = type === "xgboost";
  const content = {
    linear: { name: "Linear Regression", code: "LR-01", rmse: "45.2", mae: "30.1" },
    forest: { name: "Random Forest", code: "RF-07", rmse: "38.8", mae: "25.4" },
    xgboost: { name: "XGBoost", code: "XGB-12", rmse: "32.1", mae: "21.0" },
  }[type];
  return (
    <article className={`model-card relative min-w-0 rounded-lg border bg-card p-4 ${isBest ? "border-primary/70 shadow-neon" : "border-border"}`}>
      {isBest && <div className="absolute right-3 top-0 flex -translate-y-px items-center gap-1 rounded-b-md bg-primary px-2.5 py-1 text-[9px] font-black tracking-[0.14em] text-primary-foreground"><Crown className="size-3" /> BEST</div>}
      <div className="mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{content.code}</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">{content.name}</h3>
      </div>
      <div className="space-y-4">
        {type === "linear" && <>
          <label className="block text-[11px] font-medium text-muted-foreground">Solver
            <div className="relative mt-2"><select className="control-select w-full appearance-none" defaultValue="LBFGS"><option>LBFGS</option><option>SAGA</option></select><ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4" /></div>
          </label>
          <ParameterSlider label="Alpha" min={0} max={1} step={0.05} initial={0.35} />
        </>}
        {type === "forest" && <><ParameterSlider label="n_estimators" min={50} max={500} step={10} initial={250} /><ParameterSlider label="max_depth" min={2} max={30} initial={14} /></>}
        {type === "xgboost" && <><ParameterSlider label="learning_rate" min={0.01} max={0.5} step={0.01} initial={0.12} /><ParameterSlider label="max_depth" min={2} max={14} initial={8} /></>}
      </div>
      <div className={`mt-5 flex items-center justify-between border-y py-3 font-mono text-[11px] ${isBest ? "border-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
        <span>RMSE: <b className="text-foreground">{content.rmse}</b></span><span>MAE: <b className="text-foreground">{content.mae}</b></span>
      </div>
      <button className={isBest ? "action-primary mt-4 w-full" : "action-secondary mt-4 w-full"} onClick={() => onRetrain(type)}>
        {retraining === type ? <><RefreshCw className="size-3.5 animate-spin" /> TRAINING…</> : isBest ? <><Sparkles className="size-3.5" /> DEPLOY &amp; PREDICT</> : <><RefreshCw className="size-3.5" /> RETRAIN</>}
      </button>
    </article>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-card p-4 ${className}`}>{children}</section>;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("scatter");
  const [retraining, setRetraining] = useState<string | null>(null);
  const [deployed, setDeployed] = useState(false);
  const [fileName, setFileName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toUpperCase();
  const customerVisible = normalizedQuery === "" || "CUST-1234 JOHN DOE".includes(normalizedQuery);

  const handleModelAction = (name: string) => {
    setRetraining(name);
    window.setTimeout(() => { setRetraining(null); if (name === "xgboost") setDeployed(true); }, 900);
  };
  const captureFile = (file?: File) => { if (file) setFileName(file.name); };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); captureFile(event.dataTransfer.files[0]); };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10"><TrendingUp className="size-5 text-primary" /></div>
          <div><h1 className="text-sm font-bold tracking-[0.12em]">CLV INTELLIGENCE</h1><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Prediction operations console</p></div>
          <div className="ml-auto flex items-center gap-2 rounded-md border border-success/20 bg-success/5 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-success"><span className="size-1.5 rounded-full bg-success shadow-status" />System online</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,3fr)_minmax(310px,1fr)] xl:p-6">
        <div className="min-w-0 space-y-4">
          <Panel>
            <SectionHeading index="01" title="Model Training & Selection" icon={Bot} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ModelCard type="linear" retraining={retraining} onRetrain={handleModelAction} />
              <ModelCard type="forest" retraining={retraining} onRetrain={handleModelAction} />
              <ModelCard type="xgboost" retraining={retraining} onRetrain={handleModelAction} />
            </div>
            {deployed && <p className="mt-3 flex items-center gap-2 text-[11px] font-medium text-success"><Check className="size-3.5" /> XGBoost v12 deployed successfully.</p>}
          </Panel>

          <Panel>
            <SectionHeading index="02" title="Data Distribution & Analytics" icon={Activity} />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <ChartFrame title="Customer Purchase Frequency" subtitle="Customers by transaction bracket">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={frequencyData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke={chartTheme.grid} vertical={false} /><XAxis dataKey="bracket" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTheme.tooltip} cursor={{ fill: "var(--chart-hover)" }} /><Bar dataKey="customers" fill="var(--chart-green)" radius={[3,3,0,0]} maxBarSize={38} /></BarChart></ResponsiveContainer>
              </ChartFrame>
              <ChartFrame title="Monetary Value Distribution" subtitle="Observed and projected customer value">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={monetaryData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke={chartTheme.grid} vertical={false} /><XAxis dataKey="range" tick={{ fill: chartTheme.tick, fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTheme.tooltip} cursor={{ fill: "var(--chart-hover)" }} /><Legend wrapperStyle={{ fontSize: 10 }} /><Bar dataKey="current" name="Current" stackId="a" fill="var(--chart-cyan)" radius={[0,0,0,0]} /><Bar dataKey="projected" name="Projected" stackId="a" fill="var(--chart-green)" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer>
              </ChartFrame>
            </div>
          </Panel>

          <Panel>
            <SectionHeading index="03" title="Model Comparison Dashboard" icon={TrendingUp} />
            <div className="mb-4 flex overflow-x-auto border-b border-border" role="tablist">
              {[{ id: "scatter", label: "Actual vs Predicted" }, { id: "segments", label: "Segment CLV" }, { id: "drivers", label: "Feature Drivers" }].map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-button ${activeTab === tab.id ? "tab-active" : ""}`}>{tab.label}</button>)}
            </div>
            <div className="h-[330px] min-w-0">
              {activeTab === "scatter" && <ResponsiveContainer width="100%" height="100%"><ComposedChart margin={{ top: 10, right: 14, left: -8, bottom: 10 }}><CartesianGrid stroke={chartTheme.grid} /><XAxis type="number" dataKey="actual" name="Actual CLV" unit="k" domain={[0, 130]} tick={{ fill: chartTheme.tick, fontSize: 10 }} /><YAxis type="number" dataKey="predicted" name="Predicted CLV" unit="k" domain={[0, 130]} tick={{ fill: chartTheme.tick, fontSize: 10 }} /><Tooltip contentStyle={chartTheme.tooltip} cursor={{ stroke: "var(--border)" }} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line name="Ideal fit" data={idealLine} dataKey="predicted" stroke="var(--muted-foreground)" strokeDasharray="4 5" dot={false} isAnimationActive={false} /><Scatter name="Linear Regression" data={scatterSeries.linear} fill="var(--chart-green)" line={{ stroke: "var(--chart-green)", strokeWidth: 1 }} /><Scatter name="Random Forest" data={scatterSeries.forest} fill="var(--chart-red)" line={{ stroke: "var(--chart-red)", strokeWidth: 1 }} /><Scatter name="XGBoost" data={scatterSeries.xgboost} fill="var(--chart-purple)" line={{ stroke: "var(--chart-purple)", strokeWidth: 2 }} /></ComposedChart></ResponsiveContainer>}
              {activeTab === "segments" && <ResponsiveContainer width="100%" height="100%"><BarChart data={segmentData} margin={{ top: 22, right: 14, left: -4, bottom: 10 }}><CartesianGrid stroke={chartTheme.grid} vertical={false} /><XAxis dataKey="segment" tick={{ fill: chartTheme.tick, fontSize: 10 }} /><YAxis unit="k" tick={{ fill: chartTheme.tick, fontSize: 10 }} /><Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => [`$${value}k`, "Average CLV"]} /><Bar dataKey="clv" fill="var(--chart-cyan)" radius={[4,4,0,0]} maxBarSize={60}><ErrorBar dataKey="error" width={5} strokeWidth={1.5} stroke="var(--foreground)" /></Bar></BarChart></ResponsiveContainer>}
              {activeTab === "drivers" && <div className="grid h-full grid-cols-1 items-center md:grid-cols-2"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={driverData} dataKey="value" innerRadius="50%" outerRadius="76%" paddingAngle={3} stroke="none">{driverData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => [`${value}%`, "Contribution"]} /></PieChart></ResponsiveContainer><div className="space-y-4 px-8">{driverData.map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{item.name}</span><span className="font-mono font-bold">{item.value}%</span></div><div className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} /></div></div>)}</div></div>}
            </div>
          </Panel>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel className="xl:sticky xl:top-4">
            <SectionHeading index="04" title="Customer Lookup & Forecast" icon={Search} />
            <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="control-input w-full pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Customer ID (e.g., CUST-1234)" aria-label="Search by Customer ID" /></div>
            {customerVisible ? <>
              <div className="my-4 flex items-center gap-3 border-y border-border py-4"><div className="flex size-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10"><UserRound className="size-5 text-primary" /></div><div className="min-w-0"><h3 className="truncate text-sm font-semibold">John Doe</h3><p className="font-mono text-[10px] text-muted-foreground">CUST-1234</p></div><div className="ml-auto text-right"><p className="font-mono text-sm font-bold text-success">$128.4k</p><p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Predicted CLV</p></div></div>
              <ChartFrame title="Predicted Revenue Trend" subtitle="Historical vs 90-day forecast" compact>
                <ResponsiveContainer width="100%" height="100%"><LineChart data={forecastData} margin={{ top: 8, right: 8, left: -30, bottom: 0 }}><CartesianGrid stroke={chartTheme.grid} vertical={false} /><XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: chartTheme.tick, fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTheme.tooltip} formatter={(value) => [`$${value}k`]} /><Line type="monotone" dataKey="history" name="Historical" stroke="var(--chart-cyan)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--chart-cyan)" }} connectNulls={false} /><Line type="monotone" dataKey="forecast" name="Predicted" stroke="var(--chart-purple)" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: "var(--chart-purple)" }} connectNulls={false} /></LineChart></ResponsiveContainer>
              </ChartFrame>
              <div className="mt-3 flex justify-center"><span className="rounded-md border border-success/25 bg-success/10 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-success">HIGH VALUE CUSTOMER</span></div>
            </> : <div className="my-12 text-center"><UserRound className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="text-xs text-muted-foreground">No matching customer found.</p></div>}
          </Panel>

          <Panel>
            <SectionHeading index="05" title="Data Acquisition & Sync" icon={Database} />
            <div className="upload-zone cursor-pointer rounded-lg border border-dashed border-border p-6 text-center" onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") fileRef.current?.click(); }}>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(event) => captureFile(event.target.files?.[0])} />
              {fileName ? <><FileSpreadsheet className="mx-auto mb-3 size-7 text-success" /><p className="truncate text-xs font-semibold text-foreground">{fileName}</p><p className="mt-1 text-[10px] text-success">Ready to sync</p></> : <><CloudUpload className="mx-auto mb-3 size-7 text-primary" /><p className="text-xs font-semibold text-foreground">Drop CSV Here or Browse</p><p className="mt-1 text-[10px] text-muted-foreground">CSV files up to 25 MB</p></>}
            </div>
            <label className="mt-4 block text-[11px] font-medium text-muted-foreground">Source<div className="relative mt-2"><select className="control-select w-full appearance-none"><option>CSV Upload</option><option>Direct SQL</option><option>Shopify API</option></select><ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4" /></div></label>
            <button className="action-primary mt-4 w-full" onClick={() => { setSyncing(true); window.setTimeout(() => setSyncing(false), 1100); }}>{syncing ? <><RefreshCw className="size-4 animate-spin" /> SYNCING…</> : <><RefreshCw className="size-4" /> SYNC TO DATABASE</>}</button>
            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground"><span>Last synced: 10 mins ago</span><span className="flex items-center gap-1.5 text-success"><span className="size-1.5 rounded-full bg-success" />Healthy</span></div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-[88%] rounded-full bg-success" /></div>
          </Panel>
        </aside>
      </div>
    </main>
  );
}

function ChartFrame({ title, subtitle, children, compact = false }: { title: string; subtitle: string; children: React.ReactNode; compact?: boolean }) {
  return <div className="min-w-0 rounded-md border border-border/80 bg-chart p-3"><div className="mb-2"><h3 className="text-xs font-semibold text-foreground">{title}</h3><p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p></div><div className={compact ? "h-[220px]" : "h-[260px]"}>{children}</div></div>;
}