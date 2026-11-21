import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  Menu,
  Search,
  Sparkles,
  Wallet,
  X
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api";
import { money, percent, shortDate } from "./format";
import type { Asset, BoardStatus, DemoData, WorkItem } from "./types";

const columns: { id: BoardStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "#7f8c85" },
  { id: "researching", title: "Researching", color: "#b7f34a" },
  { id: "review", title: "In review", color: "#f4c95d" },
  { id: "done", title: "Done", color: "#50d6a0" }
];

function AssetLogo({ symbol }: { symbol: string }) {
  return <span className={`asset-logo logo-${symbol.toLowerCase()}`}>{symbol.slice(0, 1)}</span>;
}

function PortfolioCard({ title, value, detail, positive = true, icon }: {
  title: string;
  value: string;
  detail: string;
  positive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <div className={positive ? "positive" : "negative"}>
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {detail}
      </div>
    </article>
  );
}

function MiniChart({ asset }: { asset: Asset }) {
  const data = asset.history.map((value, index) => ({ index, value }));
  return (
    <div className="mini-chart" aria-label={`${asset.symbol} trend`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`mini-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={asset.changePercent >= 0 ? "#b7f34a" : "#ff7b72"} stopOpacity={0.45} />
              <stop offset="100%" stopColor={asset.changePercent >= 0 ? "#b7f34a" : "#ff7b72"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={asset.changePercent >= 0 ? "#b7f34a" : "#ff7b72"}
            fill={`url(#mini-${asset.symbol})`}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KanbanCard({ item, onMove }: { item: WorkItem; onMove: (id: string, status: BoardStatus) => void }) {
  return (
    <article
      className="kanban-card"
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
    >
      <div className="kanban-card-top">
        <span className="tag">{item.tag}</span>
        <span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
      </div>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <div className="kanban-card-footer">
        <span className="avatar">{item.owner}</span>
        <span>{shortDate(item.dueDate)}</span>
        <select
          aria-label={`Move ${item.title}`}
          value={item.status}
          onChange={(event) => onMove(item.id, event.target.value as BoardStatus)}
        >
          {columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
        </select>
      </div>
    </article>
  );
}

function App() {
  const [data, setData] = useState<DemoData | null>(null);
  const [fxRate, setFxRate] = useState(5.42);
  const [fxSource, setFxSource] = useState("demo");
  const [period, setPeriod] = useState("6M");
  const [currency, setCurrency] = useState<"USD" | "BRL">("USD");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"dashboard" | "board">("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.allSettled([api.dashboard(), api.fx()])
      .then(([dashboardResult, fxResult]) => {
        if (dashboardResult.status === "fulfilled") {
          setData(dashboardResult.value);
        } else {
          setError(dashboardResult.reason instanceof Error ? dashboardResult.reason.message : "Could not load portfolio");
        }
        if (fxResult.status === "fulfilled") {
          setFxRate(fxResult.value.rate);
          setFxSource(fxResult.value.source);
        }
      });
  }, []);

  const displayedAssets = useMemo(() => {
    if (!data) return [];
    return data.assets.filter((asset) =>
      `${asset.symbol} ${asset.name} ${asset.sector}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const portfolioValue = useMemo(() => {
    if (!data) return 0;
    return data.assets.reduce((total, asset) => total + asset.price * asset.quantity, 0);
  }, [data]);

  const displayValue = (value: number) => money(value * (currency === "BRL" ? fxRate : 1), currency);

  async function moveItem(id: string, status: BoardStatus) {
    try {
      const updated = await api.updateBoardItem(id, { status });
      setData((current) => current && ({
        ...current,
        board: current.board.map((item) => item.id === id ? updated : item)
      }));
      setToast(`Moved to ${columns.find((column) => column.id === status)?.title}`);
      window.setTimeout(() => setToast(""), 2200);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the board");
    }
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <span className="brand-mark">P</span>
        <h1>{error ? "MarketScope is unavailable" : "Loading MarketScope"}</h1>
        <p>{error || "Preparing your investment workspace..."}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark">M</span><span>MarketScope</span></div>
        <button className="close-mobile" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X /></button>
        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => { setView("dashboard"); setMobileMenu(false); }}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className={view === "board" ? "active" : ""} onClick={() => { setView("board"); setMobileMenu(false); }}>
            <ListChecks size={18} /> Research board <span className="count">{data.board.length}</span>
          </button>
        </nav>
        <div className="sidebar-label">Workspace</div>
        <nav>
          <button onClick={() => document.querySelector("#assets")?.scrollIntoView({ behavior: "smooth" })}><BarChart3 size={18} /> Markets</button>
          <button onClick={() => document.querySelector("#activity")?.scrollIntoView({ behavior: "smooth" })}><Activity size={18} /> Activity</button>
        </nav>
        <div className="sidebar-promo">
          <Sparkles size={20} />
          <strong>Portfolio demo</strong>
          <p>Built to showcase full-stack product thinking.</p>
          <span>Demo data only</span>
        </div>
        <div className="profile">
          <span className="profile-avatar">JD</span>
          <div><strong>Demo investor</strong><small>Personal workspace</small></div>
          <ChevronDown size={16} />
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu /></button>
          <div className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets..." aria-label="Search assets" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
            <button className="currency-button" onClick={() => setCurrency(currency === "USD" ? "BRL" : "USD")}>
              <span>{currency}</span><ChevronDown size={15} />
            </button>
          </div>
        </header>

        <div className="content">
          {error && <div className="error-banner">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
          {view === "dashboard" ? (
            <>
              <section className="page-heading">
                <div><span className="eyebrow">Portfolio overview</span><h1>Good morning, investor.</h1><p>Here is how your portfolio is performing today.</p></div>
                <div className="live-rate"><span className="pulse-dot" /> USD/BRL <strong>{fxRate.toFixed(2)}</strong><small>{fxSource}</small></div>
              </section>

              <section className="metrics-grid">
                <PortfolioCard title="Total balance" value={displayValue(portfolioValue)} detail="8.42% this year" icon={<Wallet size={19} />} />
                <PortfolioCard title="Today's return" value={displayValue(184.72)} detail="0.58% since yesterday" icon={<ArrowUpRight size={19} />} />
                <PortfolioCard title="Invested capital" value={displayValue(27650)} detail="13.17% unrealized gain" icon={<CircleDollarSign size={19} />} />
                <PortfolioCard title="Cash available" value={displayValue(1840)} detail="5.9% of portfolio" icon={<BarChart3 size={19} />} />
              </section>

              <section className="main-grid">
                <article className="panel performance-panel">
                  <div className="panel-header">
                    <div><h2>Portfolio performance</h2><p>Your growth across the selected period</p></div>
                    <div className="period-switcher">
                      {["1M", "3M", "6M", "1Y", "ALL"].map((value) => (
                        <button key={value} className={period === value ? "active" : ""} onClick={() => setPeriod(value)}>{value}</button>
                      ))}
                    </div>
                  </div>
                  <div className="chart-total"><strong>{displayValue(portfolioValue)}</strong><span className="positive">+14.48%</span></div>
                  <div className="performance-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.performance}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b7f34a" stopOpacity={0.32} />
                            <stop offset="100%" stopColor="#b7f34a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#24302c" vertical={false} strokeDasharray="3 6" />
                        <XAxis dataKey="date" tick={{ fill: "#78847e", fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis domain={["dataMin - 1000", "dataMax + 1000"]} tick={{ fill: "#78847e", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                        <Tooltip contentStyle={{ background: "#101915", border: "1px solid #2a3732", borderRadius: 10 }} formatter={(value: number) => [displayValue(value), "Value"]} />
                        <Area type="monotone" dataKey="value" stroke="#b7f34a" strokeWidth={3} fill="url(#portfolioGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="panel allocation-panel">
                  <div className="panel-header"><div><h2>Allocation</h2><p>By asset</p></div></div>
                  <div className="allocation-ring">
                    <div className="ring"><div><strong>5</strong><span>assets</span></div></div>
                  </div>
                  <div className="allocation-list">
                    {data.assets.slice(0, 5).map((asset, index) => (
                      <div key={asset.symbol}><i style={{ background: ["#b7f34a", "#50d6a0", "#62a5ff", "#e6a8ff", "#f4c95d"][index] }} /><span>{asset.symbol}</span><strong>{asset.allocation}%</strong></div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="panel assets-panel" id="assets">
                <div className="panel-header"><div><h2>Your assets</h2><p>Positions and recent movement</p></div><span className="demo-chip">Demo portfolio</span></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Asset</th><th>Price</th><th>24h</th><th>Position</th><th>Allocation</th><th>Trend</th></tr></thead>
                    <tbody>
                      {displayedAssets.map((asset) => (
                        <tr key={asset.symbol}>
                          <td><div className="asset-name"><AssetLogo symbol={asset.symbol} /><div><strong>{asset.symbol}</strong><span>{asset.name}</span></div></div></td>
                          <td>{displayValue(asset.price)}</td>
                          <td className={asset.changePercent >= 0 ? "positive" : "negative"}>{percent(asset.changePercent)}</td>
                          <td><strong>{asset.quantity}</strong><span className="subtle">{displayValue(asset.price * asset.quantity)}</span></td>
                          <td><div className="allocation-cell"><span>{asset.allocation}%</span><i><b style={{ width: `${asset.allocation * 3}%` }} /></i></div></td>
                          <td><MiniChart asset={asset} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {displayedAssets.length === 0 && <div className="empty-search">No assets match “{query}”.</div>}
                </div>
              </section>

              <section className="panel" id="activity">
                <div className="panel-header"><div><h2>Recent activity</h2><p>Transactions in this demo account</p></div></div>
                <div className="activity-list">
                  {data.activity.map((item) => (
                    <div className="activity-row" key={item.id}>
                      <span className={`activity-icon activity-${item.type.toLowerCase()}`}>{item.type === "Sell" ? <ArrowUpRight /> : <ArrowDownRight />}</span>
                      <div><strong>{item.type} {item.symbol}</strong><span>{item.description}</span></div>
                      <time>{shortDate(item.occurredAt)}</time>
                      <strong>{displayValue(item.amount)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="page-heading">
                <div><span className="eyebrow">Research workflow</span><h1>Investment research board</h1><p>Move ideas from exploration to a documented decision.</p></div>
                <div className="board-summary"><strong>{data.board.filter((item) => item.status === "done").length}</strong><span>completed</span></div>
              </section>
              <section className="kanban-board">
                {columns.map((column) => {
                  const items = data.board.filter((item) => item.status === column.id);
                  return (
                    <div
                      className="kanban-column"
                      key={column.id}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const id = event.dataTransfer.getData("text/plain");
                        if (id) void moveItem(id, column.id);
                      }}
                    >
                      <div className="kanban-heading"><i style={{ background: column.color }} /><h3>{column.title}</h3><span>{items.length}</span></div>
                      <div className="kanban-list">
                        {items.map((item) => <KanbanCard key={item.id} item={item} onMove={moveItem} />)}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}
          <footer><span>MarketScope demo</span><span>Not financial advice · All values are illustrative</span></footer>
        </div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
