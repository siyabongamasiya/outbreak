import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDot,
  HeartPulse,
  ShieldCheck,
  Skull,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import covidRecords from "./data/covid.json";

type ViewKey = "confirmed" | "daily" | "outcomes" | "active";
type RangeKey = "all" | "30";

type RawRecord = {
  Date: string;
  "Total Confirmed Cases": string | number;
  "Total Deaths": string | number;
  "Total Recovered": string | number;
  "Active Cases": string | number;
  "Daily Confirmed Cases": string | number;
  "Daily  deaths": number | string;
};

type DataPoint = {
  date: string;
  shortDate: string;
  confirmed: number;
  daily: number;
  deaths: number;
  recovered: number;
  active: number;
  dailyDeaths: number;
};

const normalizeValue = (value: string | number): number =>
  typeof value === "number"
    ? value
    : Number(String(value).replace(/[\s,]/g, ""));

const toDateValue = (dateString: string): Date =>
  new Date(dateString.replace(/\//g, "-") + "T00:00:00");

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-ZA").format(value);

const formatCompact = (value: number): string =>
  new Intl.NumberFormat("en-ZA", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatFullDate = (value: Date): string =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);

const formatShortDate = (value: Date): string =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
  }).format(value);

const buildData = (): DataPoint[] =>
  (covidRecords as RawRecord[]).map((record) => {
    const dateValue = toDateValue(record.Date);

    return {
      date: formatFullDate(dateValue),
      shortDate: formatShortDate(dateValue),
      confirmed: normalizeValue(record["Total Confirmed Cases"]),
      daily: normalizeValue(record["Daily Confirmed Cases"]),
      deaths: normalizeValue(record["Total Deaths"]),
      recovered: normalizeValue(record["Total Recovered"]),
      active: normalizeValue(record["Active Cases"]),
      dailyDeaths: normalizeValue(record["Daily  deaths"]),
    };
  });

const chartMeta: Record<
  ViewKey,
  {
    key: keyof Pick<DataPoint, "confirmed" | "daily" | "recovered" | "active">;
    eyebrow: string;
    heading: string;
    description: string;
    stroke: string;
    seriesName: string;
  }
> = {
  confirmed: {
    key: "confirmed",
    eyebrow: "Cumulative spread",
    heading: "Confirmed cases",
    description: "How total reported cases changed over time.",
    stroke: "var(--coral)",
    seriesName: "Confirmed cases",
  },
  daily: {
    key: "daily",
    eyebrow: "Daily movement",
    heading: "Daily new cases",
    description: "Newly reported cases for each day in the period.",
    stroke: "var(--amber)",
    seriesName: "Daily cases",
  },
  outcomes: {
    key: "recovered",
    eyebrow: "Outcome comparison",
    heading: "Deaths & recoveries",
    description: "A direct comparison of cumulative outcomes.",
    stroke: "var(--teal)",
    seriesName: "Recovered",
  },
  active: {
    key: "active",
    eyebrow: "Current burden",
    heading: "Active cases",
    description: "Confirmed cases excluding deaths and recoveries.",
    stroke: "var(--blue)",
    seriesName: "Active cases",
  },
};

const cardMeta = [
  {
    key: "confirmed" as const,
    label: "Confirmed cases",
    icon: CircleDot,
    iconBg: "var(--coral-pale)",
    iconColor: "var(--coral)",
  },
  {
    key: "active" as const,
    label: "Active cases",
    icon: HeartPulse,
    iconBg: "var(--blue-pale)",
    iconColor: "var(--blue)",
  },
  {
    key: "recovered" as const,
    label: "Recovered",
    icon: ShieldCheck,
    iconBg: "var(--teal-pale)",
    iconColor: "var(--teal)",
  },
  {
    key: "deaths" as const,
    label: "Deaths",
    icon: Skull,
    iconBg: "#e4e9ed",
    iconColor: "var(--navy)",
  },
];

const tabs = [
  {
    key: "confirmed" as const,
    label: "Confirmed cases",
    secondary: "Cumulative spread",
    color: "var(--coral)",
  },
  {
    key: "daily" as const,
    label: "Daily new cases",
    secondary: "Daily movement",
    color: "var(--amber)",
  },
  {
    key: "outcomes" as const,
    label: "Deaths & recoveries",
    secondary: "Outcome comparison",
    color: "var(--teal)",
  },
  {
    key: "active" as const,
    label: "Active cases",
    secondary: "Current burden",
    color: "var(--blue)",
  },
];

const defaultRange = "all";

function App() {
  const data = useMemo(() => buildData(), []);
  const [selectedView, setSelectedView] = useState<ViewKey>("confirmed");
  const [range, setRange] = useState<RangeKey>(defaultRange);

  const selectedData = range === "all" ? data : data.slice(-30);
  const latestData = data[data.length - 1];

  const chartTitle = chartMeta[selectedView];

  const latestTotalValue =
    selectedView === "confirmed"
      ? selectedData[selectedData.length - 1].confirmed
      : selectedView === "daily"
        ? selectedData[selectedData.length - 1].daily
        : selectedView === "outcomes"
          ? selectedData[selectedData.length - 1].recovered
          : selectedData[selectedData.length - 1].active;

  const highestDailyRise = selectedData.reduce((max, item) =>
    item.daily > max.daily ? item : max,
  );

  const renderChart = () => {
    if (selectedView === "confirmed") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={selectedData}
            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fill-confirmed" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--grid)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              interval={15}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              width={58}
              tickFormatter={(value) => formatCompact(Number(value))}
            />
            <Tooltip
              cursor={{ stroke: "var(--navy)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip__date">{label}</div>
                    {payload.map((entry) => (
                      <div
                        key={entry.dataKey as string}
                        className="chart-tooltip__row"
                      >
                        <span
                          className="chart-tooltip__swatch"
                          style={{ background: entry.color ?? "var(--coral)" }}
                        />
                        <span className="chart-tooltip__name">
                          {entry.name}
                        </span>
                        <span className="chart-tooltip__value">
                          {formatNumber(Number(entry.value ?? 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="confirmed"
              name="Confirmed cases"
              stroke="var(--coral)"
              strokeWidth={3}
              fill="url(#fill-confirmed)"
              activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (selectedView === "daily") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={selectedData}
            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--grid)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              interval={15}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              width={58}
              tickFormatter={(value) => formatCompact(Number(value))}
            />
            <Tooltip
              cursor={{ stroke: "var(--navy)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip__date">{label}</div>
                    {payload.map((entry) => (
                      <div
                        key={entry.dataKey as string}
                        className="chart-tooltip__row"
                      >
                        <span
                          className="chart-tooltip__swatch"
                          style={{ background: entry.color ?? "var(--amber)" }}
                        />
                        <span className="chart-tooltip__name">
                          {entry.name}
                        </span>
                        <span className="chart-tooltip__value">
                          {formatNumber(Number(entry.value ?? 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="var(--grid)" />
            <Bar
              dataKey="daily"
              name="Daily cases"
              fill="var(--amber)"
              radius={[4, 4, 0, 0]}
              maxBarSize={13}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (selectedView === "outcomes") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={selectedData}
            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--grid)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              interval={15}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              width={58}
              tickFormatter={(value) => formatCompact(Number(value))}
            />
            <Tooltip
              cursor={{ stroke: "var(--navy)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip__date">{label}</div>
                    {payload.map((entry) => (
                      <div
                        key={entry.dataKey as string}
                        className="chart-tooltip__row"
                      >
                        <span
                          className="chart-tooltip__swatch"
                          style={{ background: entry.color ?? "var(--teal)" }}
                        />
                        <span className="chart-tooltip__name">
                          {entry.name}
                        </span>
                        <span className="chart-tooltip__value">
                          {formatNumber(Number(entry.value ?? 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="recovered"
              name="Recovered"
              stroke="var(--teal)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
            />
            <Line
              type="monotone"
              dataKey="deaths"
              name="Deaths"
              stroke="var(--navy-soft)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={selectedData}
          margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fill-active" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--grid)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="shortDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            interval={15}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            width={58}
            tickFormatter={(value) => formatCompact(Number(value))}
          />
          <Tooltip
            cursor={{ stroke: "var(--navy)", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="chart-tooltip">
                  <div className="chart-tooltip__date">{label}</div>
                  {payload.map((entry) => (
                    <div
                      key={entry.dataKey as string}
                      className="chart-tooltip__row"
                    >
                      <span
                        className="chart-tooltip__swatch"
                        style={{ background: entry.color ?? "var(--blue)" }}
                      />
                      <span className="chart-tooltip__name">{entry.name}</span>
                      <span className="chart-tooltip__value">
                        {formatNumber(Number(entry.value ?? 0))}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="active"
            name="Active cases"
            stroke="var(--blue)"
            strokeWidth={3}
            fill="url(#fill-active)"
            activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <header className="top-header">
        <div className="content-width header-inner">
          <div className="brand" aria-label="Outbreak home">
            <div className="brand__icon">
              <Activity size={20} strokeWidth={2.2} />
            </div>
            <div className="brand__text">
              <div className="brand__title">OUTBREAK</div>
              <div className="brand__subtitle">COVID-19 tracker</div>
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <div className="content-width">
          <section className="intro" aria-labelledby="dashboard-heading">
            <div className="eyebrow">
              <Sparkles size={14} strokeWidth={2} />
              <span>South Africa health overview</span>
            </div>
            <h1 id="dashboard-heading">Tracking the first 100 days.</h1>
            <p>
              A clear view of how South Africa&apos;s COVID-19 outbreak evolved
              between 5 March and 12 June 2020.
            </p>
          </section>

          <section className="summary-grid" aria-label="Latest statistics">
            {cardMeta.map(({ key, label, icon: Icon, iconBg, iconColor }) => {
              const previousValue = data[data.length - 2][key];
              const currentValue = latestData[key];
              const change =
                previousValue === 0
                  ? 0
                  : ((currentValue - previousValue) / previousValue) * 100;
              const isPositive = change >= 0;

              return (
                <article className="summary-card" key={key}>
                  <div
                    className="summary-card__icon"
                    style={{ background: iconBg }}
                  >
                    <Icon size={18} color={iconColor} strokeWidth={2.2} />
                  </div>
                  <div className="summary-card__content">
                    <div className="summary-card__label">{label}</div>
                    <div className="summary-card__value">
                      {formatNumber(currentValue)}
                    </div>
                  </div>
                  <div
                    className={`summary-card__badge ${isPositive ? "is-positive" : "is-negative"}`}
                    aria-label={`${label} change ${change >= 0 ? "up" : "down"}`}
                  >
                    {isPositive ? (
                      <ArrowUpRight size={12} strokeWidth={2.2} />
                    ) : (
                      <ArrowDownRight size={12} strokeWidth={2.2} />
                    )}
                    {`${isPositive ? "+" : ""}${change.toFixed(1)}%`}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="dashboard-panel" aria-label="COVID-19 dashboard">
            <aside className="dashboard-sidebar">
              <div className="sidebar__block">
                <div className="sidebar__eyebrow">Explore data</div>
                <h2>Choose a view</h2>
              </div>

              <div className="tabs" role="tablist" aria-label="Chart metric">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={selectedView === tab.key}
                    className={`metric-button ${selectedView === tab.key ? "is-selected" : ""}`}
                    onClick={() => setSelectedView(tab.key)}
                  >
                    <span
                      className="metric-button__dot"
                      style={{ background: tab.color }}
                    />
                    <span className="metric-button__text">
                      <span className="metric-button__label">{tab.label}</span>
                      <span className="metric-button__secondary">
                        {tab.secondary}
                      </span>
                    </span>
                    {selectedView === tab.key && (
                      <Check size={15} color="var(--teal)" strokeWidth={2.25} />
                    )}
                  </button>
                ))}
              </div>
            </aside>

            <div className="chart-panel">
              <div className="chart-header">
                <div className="chart-header__title">
                  <div
                    className="chart-eyebrow"
                    style={{ color: "var(--coral)" }}
                  >
                    {chartTitle.eyebrow}
                  </div>
                  <h3>{chartTitle.heading}</h3>
                  <p>{chartTitle.description}</p>
                </div>

                <div className="date-range" aria-label="Date range selector">
                  <CalendarDays
                    size={15}
                    color="var(--muted)"
                    strokeWidth={2}
                  />
                  <button
                    type="button"
                    onClick={() => setRange(range === "all" ? "30" : "all")}
                  >
                    <span>{range === "all" ? "All time" : "30 days"}</span>
                    <ChevronDown size={13} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className="chart-summary">
                <div className="chart-stat">
                  <span className="chart-stat__label">Latest total</span>
                  <span className="chart-stat__value">
                    {formatNumber(latestTotalValue)}
                  </span>
                </div>
                <div className="chart-stat chart-stat--split">
                  <span className="chart-stat__label">Highest daily rise</span>
                  <span className="chart-stat__value chart-stat__value--small">
                    {formatNumber(highestDailyRise.daily)}
                    <span className="chart-stat__date">
                      {highestDailyRise.shortDate}
                    </span>
                  </span>
                </div>
              </div>

              <div className="chart-area">{renderChart()}</div>
            </div>
          </section>

          <footer className="page-footer">
            <span>COVID-19 South Africa dataset · 05 Mar — 12 Jun 2020</span>
            <span>Designed for clarity, not clinical use</span>
          </footer>
        </div>
      </main>
    </>
  );
}

export default App;
