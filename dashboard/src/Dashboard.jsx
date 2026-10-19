import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/* ───────────── helpers ───────────── */
const DAY = 864e5;
const d0 = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addD = (d, n) => {
  const x = d0(d);
  x.setDate(x.getDate() + n);
  return x;
};
const iso = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const lbl = (d) =>
  d0(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const TODAY = d0(new Date());
const inR = (s, f, t) => s >= iso(f) && s <= iso(t);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const cmp = (n) =>
  n >= 1e5
    ? (n / 1e5).toFixed(1) + "L"
    : n >= 1e3
      ? (n / 1e3).toFixed(1) + "K"
      : String(Math.round(n));
const pct = (a, b) => (b ? (a / b) * 100 : 0);
const chg = (c, p) => (p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100);

const C = {
  blue: "#2563eb",
  green: "#10b981",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  cyan: "#06b6d4",
};
const STAGE_C = {
  Pending: C.amber,
  "In Progress": C.blue,
  Completed: C.green,
  "On Hold": C.red,
};
const STAGES = Object.keys(STAGE_C);
const SERVICES = [
  ["Private Limited Company", 21000],
  ["LLP Registration", 9000],
  ["GST Registration", 6500],
  ["Trademark", 5500],
  ["FSSAI License", 7000],
  ["Annual Compliance", 8000],
  ["ISO Certification", 7500],
  ["Startup India", 4500],
];
const SALES = ["Nancy Singh", "Sneha Choudhary", "Tannu Kumari", "Rahul Verma"];
const OPS = ["Gaurav Pant", "Srishti Upadhyay", "Azam Afaroz"];
const SOURCES = ["Google Ads", "Website", "Just Dial", "Other"];
const SRC_C = [C.blue, C.green, C.purple, C.amber];

/* ───────────── dummy relational data: lead → quotation → deal → order / payment ───────────── */
function build() {
  let s = 42;
  const r = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (a) => a[Math.floor(r() * a.length)];
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const first = [
    "Aarav",
    "Priya",
    "Rohan",
    "Isha",
    "Karan",
    "Meera",
    "Vikram",
    "Anjali",
    "Arjun",
    "Divya",
    "Manish",
    "Pooja",
  ];
  const last = [
    "Sharma",
    "Patel",
    "Gupta",
    "Reddy",
    "Iyer",
    "Nair",
    "Khan",
    "Das",
    "Mehta",
    "Joshi",
  ];
  const cap = (d) => (d > TODAY ? TODAY : d);
  const leads = [],
    quotes = [],
    deals = [],
    orders = [],
    payments = [];
  let li = 0,
    qi = 0,
    di = 0,
    oi = 0,
    pi = 0;

  for (let back = 120; back >= 0; back--) {
    const day = addD(TODAY, -back);
    for (let k = ri(2, 6); k > 0; k--) {
      const x = r();
      const status =
        x < 0.4
          ? "Unqualified"
          : x < 0.72
            ? "Qualified"
            : x < 0.92
              ? "Converted"
              : "New";
      const sr = r();
      const lead = {
        id: "L-" + (209000 + li++),
        name: `${pick(first)} ${pick(last)}`,
        date: iso(day),
        status,
        source:
          sr < 0.6
            ? SOURCES[0]
            : sr < 0.85
              ? SOURCES[1]
              : sr < 0.93
                ? SOURCES[2]
                : SOURCES[3],
        owner: pick(SALES),
      };
      leads.push(lead);
      if (status !== "Qualified" && status !== "Converted") continue;

      for (let k2 = ri(1, 3), j = 0; j < k2; j++) {
        const [service, base] = pick(SERVICES);
        const qd = cap(addD(day, ri(0, 3)));
        const accepted = status === "Converted" && j === 0;
        const q = {
          id: "Q-" + (10000 + qi++),
          leadId: lead.id,
          service,
          date: iso(qd),
          amount: Math.round((base * (0.8 + r() * 0.8)) / 100) * 100,
          status: accepted ? "Accepted" : r() < 0.7 ? "Pending" : "Rejected",
        };
        quotes.push(q);
        if (!accepted) continue;

        const dd = cap(addD(qd, ri(0, 2)));
        const dr = r();
        const deal = {
          id: "D-" + (800 + di++),
          leadId: lead.id,
          quoteId: q.id,
          service,
          value: q.amount,
          date: iso(dd),
          priority: dr < 0.55 ? "High" : dr < 0.9 ? "Medium" : "Low",
        };
        deals.push(deal);
        const age = Math.round((TODAY - dd) / DAY);
        for (let o = ri(1, 2); o > 0; o--) {
          const done = r() < Math.min(0.85, age / 25);
          const stage = done
            ? "Completed"
            : pick([
                "Pending",
                "Pending",
                "In Progress",
                "In Progress",
                "In Progress",
                "On Hold",
              ]);
          orders.push({
            id: "O-" + (2000 + oi++),
            dealId: deal.id,
            service,
            stage,
            ops: pick(OPS),
            date: iso(dd),
            overdue: !done && age > 10 && r() < 0.35,
          });
        }
        const frac = pick([0, 0.3, 0.5, 1, 1]);
        const parts = frac === 0 ? 0 : ri(1, 2);
        for (let p = 0; p < parts; p++) {
          payments.push({
            id: "P-" + (1000 + pi++),
            dealId: deal.id,
            date: iso(cap(addD(dd, ri(0, 6)))),
            amount: Math.round((deal.value * frac) / parts),
            method: pick(["UPI", "Bank Transfer", "Card"]),
          });
        }
      }
    }
  }
  return { leads, quotes, deals, orders, payments };
}
const DATA = build();
const leadBy = Object.fromEntries(DATA.leads.map((l) => [l.id, l]));
const dealBy = Object.fromEntries(DATA.deals.map((d) => [d.id, d]));
const quoteBy = Object.fromEntries(DATA.quotes.map((q) => [q.id, q]));
const paidBy = {};
DATA.payments.forEach(
  (p) => (paidBy[p.dealId] = (paidBy[p.dealId] || 0) + p.amount),
);

/* ───────────── analytics for one period ───────────── */
function slice(from, to, owner) {
  const ok = (leadId) => owner === "All" || leadBy[leadId].owner === owner;
  const L = DATA.leads.filter(
    (l) => inR(l.date, from, to) && (owner === "All" || l.owner === owner),
  );
  const Q = DATA.quotes.filter((q) => inR(q.date, from, to) && ok(q.leadId));
  const D = DATA.deals.filter((d) => inR(d.date, from, to) && ok(d.leadId));
  const ids = new Set(D.map((d) => d.id));
  const O = DATA.orders.filter((o) => ids.has(o.dealId));
  const P = DATA.payments.filter(
    (p) => inR(p.date, from, to) && ok(dealBy[p.dealId].leadId),
  );
  const qualified = L.filter(
    (l) => l.status === "Qualified" || l.status === "Converted",
  ).length;
  const converted = L.filter((l) => l.status === "Converted").length;
  return {
    L,
    Q,
    D,
    O,
    P,
    qualified,
    converted,
    unq: L.filter((l) => l.status === "Unqualified").length,
    rate: pct(converted, L.length),
    revenue: D.reduce((a, d) => a + d.value, 0),
    collected: D.reduce((a, d) => a + (paidBy[d.id] || 0), 0),
  };
}

/* ───────────── small UI pieces ───────────── */
const Card = ({ title, right, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}
  >
    {(title || right) && (
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="font-semibold text-slate-900 text-[15px]">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </div>
);
const Section = ({ icon, children }) => (
  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mt-8 mb-3">
    <span className="text-blue-600">{icon}</span>
    {children}
  </h2>
);
const Delta = ({ cur, prev, n, invert }) => {
  const v = chg(cur, prev),
    up = v >= 0,
    good = invert ? !up : up;
  return (
    <div
      className={`text-xs mt-2 ${good ? "text-emerald-600" : "text-red-500"}`}
    >
      <b>
        {up ? "▲" : "▼"} {Math.abs(v).toFixed(1)}%
      </b>{" "}
      <span className="text-slate-400">
        vs. previous {n} day{n > 1 ? "s" : ""}
      </span>
    </div>
  );
};
const Avatar = ({ name, color = "#6366f1" }) => (
  <span
    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-semibold mr-2"
    style={{ background: color }}
  >
    {name[0]}
  </span>
);
const Badge = ({ children, color }) => (
  <span
    className="px-2 py-0.5 rounded-full text-[11px] font-medium"
    style={{ background: color + "22", color }}
  >
    {children}
  </span>
);
const Table = ({ head, children, className = "max-h-64" }) => (
  <div className={`overflow-auto ${className}`}>
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-white">
        <tr className="text-slate-500 text-xs text-left">
          {head.map((h, i) => (
            <th
              key={h}
              className={`py-2 pr-3 font-medium ${i ? "text-right" : ""}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="[&_td]:py-2 [&_td]:pr-3 [&_td:not(:first-child)]:text-right [&_tr]:border-t [&_tr]:border-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);
const Link = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="text-blue-600 hover:underline font-medium text-left"
  >
    {children}
  </button>
);
const Empty = () => (
  <div className="text-sm text-slate-400 py-10 text-center">
    No data for this selection
  </div>
);
const tip = { contentStyle: { fontSize: 12, borderRadius: 8 } };

/* ───────────── dashboard ───────────── */
export default function Dashboard() {
  const [preset, setPreset] = useState(30);
  const [cFrom, setCFrom] = useState(iso(addD(TODAY, -14)));
  const [cTo, setCTo] = useState(iso(TODAY));
  const [owner, setOwner] = useState("All");
  const [dept, setDept] = useState("All");
  const [stack, setStack] = useState([]);

  const range = useMemo(() => {
    if (preset === "custom") {
      let f = d0(cFrom),
        t = d0(cTo);
      if (f > t) [f, t] = [t, f];
      return { from: f, to: t };
    }
    return { from: addD(TODAY, -(preset - 1)), to: TODAY };
  }, [preset, cFrom, cTo]);
  const n = Math.round((range.to - range.from) / DAY) + 1;
  const prev = { to: addD(range.from, -1), from: addD(range.from, -n) };

  const cur = useMemo(() => slice(range.from, range.to, owner), [range, owner]);
  const old = useMemo(() => slice(prev.from, prev.to, owner), [range, owner]); // eslint-disable-line

  const days = useMemo(
    () => Array.from({ length: n }, (_, i) => addD(range.from, i)),
    [range, n],
  );
  const trend = days.map((d) => {
    const k = iso(d);
    const L = cur.L.filter((l) => l.date === k);
    return {
      day: lbl(d),
      New: L.length,
      Qualified: L.filter(
        (l) => l.status === "Qualified" || l.status === "Converted",
      ).length,
      Converted: L.filter((l) => l.status === "Converted").length,
      Revenue: cur.D.filter((x) => x.date === k).reduce(
        (a, x) => a + x.value,
        0,
      ),
      Collected: cur.P.filter((x) => x.date === k).reduce(
        (a, x) => a + x.amount,
        0,
      ),
    };
  });
  let run = 0;
  const cumulative = trend.map((t) => ({
    day: t.day,
    Cumulative: (run += t.Collected),
  }));

  const byService = SERVICES.map(([name]) => {
    const Q = cur.Q.filter((q) => q.service === name),
      D = cur.D.filter((d) => d.service === name);
    const acc = Q.filter((q) => q.status === "Accepted").length;
    return {
      name,
      short: name.length > 11 ? name.slice(0, 10) + "…" : name,
      quotes: Q.length,
      amount: Q.reduce((a, q) => a + q.amount, 0),
      accepted: acc,
      pending: Q.filter((q) => q.status === "Pending").length,
      rejected: Q.filter((q) => q.status === "Rejected").length,
      conv: pct(acc, Q.length),
      deals: D.length,
      revenue: D.reduce((a, d) => a + d.value, 0),
    };
  });
  const qTotal = byService.reduce((a, s) => a + s.amount, 0);
  const rTotal = byService.reduce((a, s) => a + s.revenue, 0);
  const sources = SOURCES.map((name, i) => ({
    name,
    value: cur.L.filter((l) => l.source === name).length,
    color: SRC_C[i],
  }));
  const priority = ["High", "Medium", "Low"].map((p) => {
    const D = cur.D.filter((d) => d.priority === p);
    return { p, deals: D.length, revenue: D.reduce((a, d) => a + d.value, 0) };
  });
  const orderStatus = STAGES.map((s) => ({
    name: s,
    value: cur.O.filter((o) => o.stage === s).length,
  }));
  const stageByService = byService.map((s) => ({
    name: s.short,
    ...Object.fromEntries(
      STAGES.map((st) => [
        st,
        cur.O.filter((o) => o.service === s.name && o.stage === st).length,
      ]),
    ),
  }));
  const target = (1000000 * n) / 30;

  const sales = SALES.filter((u) => owner === "All" || u === owner).map((u) => {
    const L = cur.L.filter((l) => l.owner === u),
      D = cur.D.filter((d) => leadBy[d.leadId].owner === u);
    const conv = L.filter((l) => l.status === "Converted").length;
    return {
      u,
      leads: L.length,
      qual: L.filter((l) => l.status !== "Unqualified" && l.status !== "New")
        .length,
      conv,
      rate: pct(conv, L.length),
      quotes: cur.Q.filter((q) => leadBy[q.leadId].owner === u).length,
      deals: D.length,
      value: D.reduce((a, d) => a + d.value, 0),
      rev: D.reduce((a, d) => a + (paidBy[d.id] || 0), 0),
    };
  });
  const ops = OPS.map((u) => {
    const O = cur.O.filter((o) => o.ops === u);
    return {
      u,
      total: O.length,
      done: O.filter((o) => o.stage === "Completed").length,
      pend: O.filter((o) => o.stage !== "Completed").length,
      over: O.filter((o) => o.overdue).length,
    };
  });

  const activity = [
    ...cur.L.map((l) => ({
      t: l.date,
      u: l.owner,
      a: "Lead created",
      rec: l.id,
      lead: l.id,
    })),
    ...cur.Q.map((q) => ({
      t: q.date,
      u: leadBy[q.leadId].owner,
      a: "Quotation created",
      rec: q.id,
      lead: q.leadId,
    })),
    ...cur.D.map((d) => ({
      t: d.date,
      u: leadBy[d.leadId].owner,
      a: "Deal created",
      rec: d.id,
      deal: d.id,
    })),
    ...cur.P.map((p) => ({
      t: p.date,
      u: leadBy[dealBy[p.dealId].leadId].owner,
      a: "Payment recorded",
      rec: p.id,
      deal: p.dealId,
    })),
  ]
    .sort((a, b) => (a.t < b.t ? 1 : -1))
    .slice(0, 8);

  const push = (type, id) => setStack((s) => [...s, { type, id }]);
  const exportCsv = () => {
    const rows = [
      ["Lead ID", "Name", "Source", "Status", "Owner", "Date"],
      ...cur.L.map((l) => [l.id, l.name, l.source, l.status, l.owner, l.date]),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }),
    );
    a.download = `leads_${iso(range.from)}_${iso(range.to)}.csv`;
    a.click();
  };

  const kpis = [
    ["New Leads", cur.L.length, old.L.length, null],
    [
      "Qualified Leads",
      cur.qualified,
      old.qualified,
      `${pct(cur.qualified, cur.L.length).toFixed(1)}% qualified`,
    ],
    [
      "Converted Leads",
      cur.converted,
      old.converted,
      `${cur.rate.toFixed(1)}% conversion`,
    ],
    [
      "Unqualified Leads",
      cur.unq,
      old.unq,
      `${pct(cur.unq, cur.L.length).toFixed(1)}% unqualified`,
      true,
    ],
    [
      "Conversion Rate",
      cur.rate.toFixed(1) + "%",
      old.rate,
      null,
      false,
      cur.rate,
    ],
    ["Quotations Created", cur.Q.length, old.Q.length, null],
    ["Deals Created", cur.D.length, old.D.length, null],
    ["Payments Received", cur.P.length, old.P.length, null],
  ];
  const funnel = [
    ["New Leads", cur.L.length, C.blue, 100],
    ["Qualified", cur.qualified, C.green, pct(cur.qualified, cur.L.length)],
    ["Converted", cur.converted, C.amber, pct(cur.converted, cur.L.length)],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
      {/* header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">
            Business Performance &amp; Revenue Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Track your leads, conversions, quotations, deals, revenue and
            operations in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 text-sm">
              {[[1, "Today"], [7, "Last 7 Days"], [30, "Last 30 Days"], ["custom", "Custom"]].map(([v, t]) => (
                <button key={v} onClick={() => setPreset(v)} className={`px-3 py-1.5 rounded-md whitespace-nowrap ${preset === v ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{t}</button>
              ))}
            </div>
            {preset === "custom" && (
              <div className="absolute right-0 top-full mt-2 z-40 flex items-center gap-2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
                <input type="date" value={cFrom} min={iso(addD(TODAY, -120))} max={iso(TODAY)} onChange={(e) => e.target.value && setCFrom(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white" />
                <span>–</span>
                <input type="date" value={cTo} min={iso(addD(TODAY, -120))} max={iso(TODAY)} onChange={(e) => e.target.value && setCTo(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white" />
              </div>
            )}
          </div>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="All">All Users</option>
            {SALES.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="All">All Departments</option>
            <option>Sales</option>
            <option>Operations</option>
          </select>
          <button
            onClick={exportCsv}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Export
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Showing {lbl(range.from)} – {lbl(range.to)} · compared with{" "}
        {lbl(prev.from)} – {lbl(prev.to)}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mt-4">
        {kpis.map(([t, v, p, sub, inv, rawRate]) => (
          <Card key={t} className="!p-4">
            <div className="text-sm text-slate-500">{t}</div>
            <div className="flex items-end justify-between mt-1">
              <div className="text-2xl font-bold">{v}</div>
              {sub && (
                <div className="text-[11px] text-slate-400 text-right">
                  {sub}
                </div>
              )}
            </div>
            <Delta cur={rawRate ?? v} prev={p} n={n} invert={inv} />
          </Card>
        ))}
      </div>

      {/* lead analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
        <Card title="Target Achievement" className="lg:col-span-3">
          <div className="text-xs text-slate-500">
            Revenue target (pro-rated for {n} days)
          </div>
          <div className="text-2xl font-bold mt-1">{inr(target)}</div>
          <div className="mt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-600">● Achieved</span>
              <b>{inr(cur.revenue)}</b>
              <span className="text-slate-400">
                {pct(cur.revenue, target).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">● Remaining</span>
              <b>{inr(Math.max(0, target - cur.revenue))}</b>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded mt-3">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: Math.min(100, pct(cur.revenue, target)) + "%" }}
            />
          </div>
        </Card>
        <Card title="Lead Funnel" className="lg:col-span-3">
          <div className="flex flex-col items-center gap-1 mt-2">
            {funnel.map(([t, v, c, p]) => (
              <div
                key={t}
                className="text-white text-center text-xs font-semibold py-2"
                style={{
                  width: `${Math.max(p, 30)}%`,
                  background: c,
                  clipPath: "polygon(0 0,100% 0,92% 100%,8% 100%)",
                }}
              >
                {t}
                <br />
                {v} <span className="opacity-80">({p.toFixed(0)}%)</span>
              </div>
            ))}
            <div className="text-xs mt-2 border border-dashed border-purple-300 bg-purple-50 text-purple-700 rounded px-3 py-1.5">
              Unqualified {cur.unq} ({pct(cur.unq, cur.L.length).toFixed(1)}%)
            </div>
          </div>
        </Card>
        <Card title="Daily Lead Trend" className="lg:col-span-4">
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  dataKey="New"
                  stroke={C.blue}
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  dataKey="Qualified"
                  stroke={C.green}
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  dataKey="Converted"
                  stroke={C.amber}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Lead Sources" className="lg:col-span-2">
          {cur.L.length ? (
            <>
              <div className="h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sources}
                      dataKey="value"
                      innerRadius={32}
                      outerRadius={52}
                      stroke="none"
                    >
                      {sources.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {sources.map((s) => (
                <div
                  key={s.name}
                  className="flex justify-between text-xs py-0.5"
                >
                  <span>
                    <span style={{ color: s.color }}>●</span> {s.name}
                  </span>
                  <b>
                    {s.value} ({pct(s.value, cur.L.length).toFixed(0)}%)
                  </b>
                </div>
              ))}
            </>
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      {/* quotations */}
      <Section icon="🗒">Quotation Analytics</Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <Card
          title="Quotations by Service / Order Category"
          className="lg:col-span-3"
        >
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={byService}>
                <XAxis
                  dataKey="short"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  width={26}
                />
                <Tooltip {...tip} />
                <Bar
                  dataKey="quotes"
                  fill={C.blue}
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={(d) => push("service", d.name)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Quotation Value by Service" className="lg:col-span-3">
          <div className="space-y-2 mt-1">
            {[...byService]
              .sort((a, b) => b.amount - a.amount)
              .map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => push("service", s.name)}
                  className="block w-full text-left"
                >
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{s.name}</span>
                    <b>
                      {cmp(s.amount)} ({pct(s.amount, qTotal).toFixed(0)}%)
                    </b>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded">
                    <div
                      className="h-1.5 rounded"
                      style={{
                        width: pct(s.amount, qTotal) + "%",
                        background: Object.values(C)[i % 6],
                      }}
                    />
                  </div>
                </button>
              ))}
          </div>
        </Card>
        <Card title="Service Wise Quotation Details" className="lg:col-span-4">
          <Table
            head={[
              "Service",
              "Qty",
              "Amount",
              "Accepted",
              "Pending",
              "Rejected",
              "Conv.",
            ]}
          >
            {byService.map((s) => (
              <tr key={s.name}>
                <td>
                  <Link onClick={() => push("service", s.name)}>{s.name}</Link>
                </td>
                <td>{s.quotes}</td>
                <td>{inr(s.amount)}</td>
                <td>{s.accepted}</td>
                <td>{s.pending}</td>
                <td>{s.rejected}</td>
                <td className="font-semibold">{s.conv.toFixed(0)}%</td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Quote to Deal Conversion" className="lg:col-span-2">
          <div className="relative h-36">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { v: cur.D.length },
                    { v: Math.max(0, cur.Q.length - cur.D.length) },
                  ]}
                  dataKey="v"
                  innerRadius={44}
                  outerRadius={58}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill={C.blue} />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {pct(cur.D.length, cur.Q.length).toFixed(1)}%
            </div>
          </div>
          <div className="text-xs text-center text-slate-500">
            {cur.D.length} Deals / {cur.Q.length} Quotations
          </div>
        </Card>
      </div>
      <Card title="Quotation History (lead-wise)" className="mt-3">
        <Table
          head={[
            "Lead",
            "Name",
            "Quotations",
            "Quoted amount",
            "Accepted",
            "Status",
          ]}
          className="max-h-60"
        >
          {cur.L.filter((l) => DATA.quotes.some((q) => q.leadId === l.id))
            .slice()
            .reverse()
            .slice(0, 40)
            .map((l) => {
              const Q = DATA.quotes.filter((q) => q.leadId === l.id);
              return (
                <tr key={l.id}>
                  <td>
                    <Link onClick={() => push("lead", l.id)}>{l.id}</Link>
                  </td>
                  <td>{l.name}</td>
                  <td>{Q.length}</td>
                  <td>{inr(Q.reduce((a, q) => a + q.amount, 0))}</td>
                  <td>{Q.filter((q) => q.status === "Accepted").length}</td>
                  <td>{l.status}</td>
                </tr>
              );
            })}
        </Table>
      </Card>

      {/* deals & revenue */}
      <Section icon="₹">Deals &amp; Revenue</Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <Card
          title="Deals Created vs Deal Revenue (by Service)"
          className="lg:col-span-4"
        >
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={byService}>
                <XAxis
                  dataKey="short"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="l"
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  width={26}
                />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickFormatter={cmp}
                  width={36}
                />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="deals" name="Deals" fill={C.blue} />
                <Bar
                  yAxisId="r"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  fill={C.amber}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card
          title="Revenue by Order / Service Category"
          className="lg:col-span-3"
        >
          <div className="space-y-2">
            {[...byService]
              .sort((a, b) => b.revenue - a.revenue)
              .map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{s.name}</span>
                    <b>
                      {cmp(s.revenue)} ({pct(s.revenue, rTotal).toFixed(1)}%)
                    </b>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded">
                    <div
                      className="h-1.5 rounded bg-blue-600"
                      style={{ width: pct(s.revenue, rTotal) + "%" }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card title="Priority Breakdown" className="lg:col-span-2">
          <Table head={["Priority", "Deals", "Revenue", "%"]}>
            {priority.map((p, i) => (
              <tr key={p.p}>
                <td>
                  <span style={{ color: [C.red, C.amber, C.green][i] }}>●</span>{" "}
                  {p.p}
                </td>
                <td>{p.deals}</td>
                <td>{inr(p.revenue)}</td>
                <td className="font-semibold">
                  {pct(p.revenue, cur.revenue).toFixed(1)}%
                </td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card
          title="Total vs Collected Revenue"
          className="lg:col-span-3 lg:col-start-10 lg:row-span-1"
        >
          <div className="space-y-2">
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-xs text-blue-700">Total Deal Value</div>
              <div className="text-lg font-bold">{inr(cur.revenue)}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="text-xs text-emerald-700">
                Net Collected Revenue
              </div>
              <div className="text-lg font-bold">{inr(cur.collected)}</div>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <div className="text-xs text-red-600">Outstanding Revenue</div>
              <div className="text-lg font-bold">
                {inr(cur.revenue - cur.collected)}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <Card title="Daily Revenue Trend">
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={cmp} width={36} />
                <Tooltip {...tip} formatter={(v) => inr(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Revenue" fill={C.blue} />
                <Bar dataKey="Collected" fill={C.green} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Deal Progress (payment collected)">
          <Table head={["Deal", "Lead", "Service", "Value", "Collected"]}>
            {cur.D.slice()
              .reverse()
              .slice(0, 30)
              .map((d) => {
                const p = pct(paidBy[d.id] || 0, d.value);
                return (
                  <tr key={d.id}>
                    <td>
                      <Link onClick={() => push("deal", d.id)}>{d.id}</Link>
                    </td>
                    <td>{leadBy[d.leadId].name}</td>
                    <td className="truncate max-w-[110px]">{d.service}</td>
                    <td>{inr(d.value)}</td>
                    <td className="w-24">
                      <div className="h-1.5 bg-slate-100 rounded">
                        <div
                          className="h-1.5 rounded bg-emerald-500"
                          style={{ width: p + "%" }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {p.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
          </Table>
        </Card>
      </div>

      {/* orders & payments */}
      <Section icon="">Orders &amp; Payments</Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <Card title="Order Status" className="lg:col-span-3">
          <div className="h-36">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="value"
                  innerRadius={32}
                  outerRadius={55}
                  stroke="none"
                >
                  {orderStatus.map((s) => (
                    <Cell key={s.name} fill={STAGE_C[s.name]} />
                  ))}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {orderStatus.map((s) => (
            <div key={s.name} className="flex justify-between text-xs py-0.5">
              <span style={{ color: STAGE_C[s.name] }}>
                ● <span className="text-slate-700">{s.name}</span>
              </span>
              <b>{s.value}</b>
            </div>
          ))}
          <div className="text-xs text-slate-500 mt-2 border-t pt-2">
            Completed orders:{" "}
            <b>{cur.O.filter((o) => o.stage === "Completed").length}</b> of{" "}
            {cur.O.length}
          </div>
        </Card>
        <Card title="Orders & Stage Progress" className="lg:col-span-5">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={stageByService} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={80}
                />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {STAGES.map((s) => (
                  <Bar key={s} dataKey={s} stackId="a" fill={STAGE_C[s]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Collection Trend (cumulative)" className="lg:col-span-4">
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={cumulative}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={cmp} width={38} />
                <Tooltip {...tip} formatter={(v) => inr(v)} />
                <Line
                  dataKey="Cumulative"
                  stroke={C.green}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card title="Payment History" className="mt-3">
        <Table head={["Payment", "Deal", "Lead", "Date", "Method", "Amount"]}>
          {cur.P.slice()
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 40)
            .map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <Link onClick={() => push("deal", p.dealId)}>{p.dealId}</Link>
                </td>
                <td>{leadBy[dealBy[p.dealId].leadId].name}</td>
                <td>{p.date}</td>
                <td>{p.method}</td>
                <td className="font-semibold">{inr(p.amount)}</td>
              </tr>
            ))}
        </Table>
      </Card>

      {/* teams + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
        <div className="lg:col-span-8 space-y-3">
          {dept !== "Operations" && (
            <Card
              title="Sales Team Activity"
              right={<Badge color={C.blue}>Sales Team</Badge>}
            >
              <Table
                head={[
                  "User",
                  "Leads",
                  "Qualified",
                  "Converted",
                  "Conv. %",
                  "Quotations",
                  "Deals",
                  "Deal Value",
                  "Revenue",
                ]}
              >
                {sales.map((s) => (
                  <tr key={s.u}>
                    <td>
                      <Avatar name={s.u} />
                      {s.u}
                    </td>
                    <td>{s.leads}</td>
                    <td>{s.qual}</td>
                    <td>{s.conv}</td>
                    <td className="font-semibold">{s.rate.toFixed(1)}%</td>
                    <td>{s.quotes}</td>
                    <td>{s.deals}</td>
                    <td>{inr(s.value)}</td>
                    <td className="font-semibold">{inr(s.rev)}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
          {dept !== "Sales" && (
            <Card
              title="Operations Team Activity"
              right={<Badge color={C.purple}>Operations</Badge>}
            >
              <Table
                head={[
                  "User",
                  "Orders Updated",
                  "Stages Completed",
                  "Pending Stages",
                  "Overdue Orders",
                ]}
              >
                {ops.map((o) => (
                  <tr key={o.u}>
                    <td>
                      <Avatar name={o.u} color={C.cyan} />
                      {o.u}
                    </td>
                    <td>{o.total}</td>
                    <td>{o.done}</td>
                    <td>{o.pend}</td>
                    <td className={o.over ? "text-red-500 font-semibold" : ""}>
                      {o.over}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </div>
        <Card title="Recent CRM Activity" className="lg:col-span-4">
          <Table
            head={["Time", "Employee", "Action", "Record"]}
            className="max-h-[28rem]"
          >
            {activity.map((a, i) => (
              <tr key={i} className="text-xs">
                <td className="text-slate-400">{a.t}</td>
                <td>{a.u}</td>
                <td>{a.a}</td>
                <td>
                  <Link
                    onClick={() =>
                      a.deal ? push("deal", a.deal) : push("lead", a.lead)
                    }
                  >
                    {a.rec}
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {stack.length > 0 && (
        <Drill
          stack={stack}
          push={push}
          back={() => setStack((s) => s.slice(0, -1))}
          close={() => setStack([])}
          range={range}
          cur={cur}
        />
      )}
    </div>
  );
}

/* ───────────── drill-down modal ───────────── */
function Drill({ stack, push, back, close, cur }) {
  const { type, id } = stack[stack.length - 1];
  let title, body;

  if (type === "lead") {
    const l = leadBy[id];
    const Q = DATA.quotes.filter((q) => q.leadId === id),
      D = DATA.deals.filter((d) => d.leadId === id);
    title = `Lead ${l.id} · ${l.name}`;
    body = (
      <>
        <Info
          items={[
            ["Status", l.status],
            ["Source", l.source],
            ["Owner", l.owner],
            ["Created", l.date],
          ]}
        />
        <h4 className="font-semibold mt-4 mb-1">Quotations ({Q.length})</h4>
        <Table
          head={["Quote", "Service", "Date", "Amount", "Status"]}
          className="max-h-48"
        >
          {Q.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.service}</td>
              <td>{q.date}</td>
              <td>{inr(q.amount)}</td>
              <td>{q.status}</td>
            </tr>
          ))}
        </Table>
        <h4 className="font-semibold mt-4 mb-1">Deals ({D.length})</h4>
        {D.length ? (
          <Table
            head={["Deal", "Service", "Value", "Priority", "Collected"]}
            className="max-h-48"
          >
            {D.map((d) => (
              <tr key={d.id}>
                <td>
                  <Link onClick={() => push("deal", d.id)}>{d.id}</Link>
                </td>
                <td>{d.service}</td>
                <td>{inr(d.value)}</td>
                <td>{d.priority}</td>
                <td>{inr(paidBy[d.id] || 0)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-sm text-slate-400">No deals yet.</p>
        )}
      </>
    );
  } else if (type === "deal") {
    const d = dealBy[id],
      O = DATA.orders.filter((o) => o.dealId === id),
      P = DATA.payments.filter((p) => p.dealId === id);
    const paid = paidBy[id] || 0;
    title = `Deal ${d.id} · ${d.service}`;
    body = (
      <>
        <Info
          items={[
            ["Lead", leadBy[d.leadId].name],
            ["Quotation", d.quoteId],
            ["Priority", d.priority],
            ["Created", d.date],
            ["Value", inr(d.value)],
            ["Collected", inr(paid)],
            ["Outstanding", inr(d.value - paid)],
          ]}
        />
        <div className="h-2 bg-slate-100 rounded mt-3">
          <div
            className="h-2 bg-emerald-500 rounded"
            style={{ width: pct(paid, d.value) + "%" }}
          />
        </div>
        <h4 className="font-semibold mt-4 mb-1">Orders ({O.length})</h4>
        <Table
          head={["Order", "Stage", "Assigned to", "Overdue"]}
          className="max-h-48"
        >
          {O.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>
                <Badge color={STAGE_C[o.stage]}>{o.stage}</Badge>
              </td>
              <td>{o.ops}</td>
              <td>{o.overdue ? "Yes" : "No"}</td>
            </tr>
          ))}
        </Table>
        <h4 className="font-semibold mt-4 mb-1">Payments ({P.length})</h4>
        {P.length ? (
          <Table
            head={["Payment", "Date", "Method", "Amount"]}
            className="max-h-48"
          >
            {P.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.date}</td>
                <td>{p.method}</td>
                <td>{inr(p.amount)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-sm text-slate-400">No payments recorded.</p>
        )}
        <button
          onClick={() => push("lead", d.leadId)}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          View lead →
        </button>
      </>
    );
  } else {
    const Q = cur.Q.filter((q) => q.service === id);
    title = `Quotations · ${id}`;
    body = (
      <>
        <Info
          items={[
            ["Quotations", Q.length],
            ["Total quoted", inr(Q.reduce((a, q) => a + q.amount, 0))],
            ["Accepted", Q.filter((q) => q.status === "Accepted").length],
          ]}
        />
        <Table
          head={["Quote", "Lead", "Date", "Amount", "Status"]}
          className="max-h-80 mt-3"
        >
          {Q.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>
                <Link onClick={() => push("lead", q.leadId)}>
                  {leadBy[q.leadId].name}
                </Link>
              </td>
              <td>{q.date}</td>
              <td>{inr(q.amount)}</td>
              <td>{q.status}</td>
            </tr>
          ))}
        </Table>
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {stack.length > 1 && (
              <button onClick={back} className="text-sm text-blue-600">
                ← Back
              </button>
            )}
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {body}
      </div>
    </div>
  );
}
const Info = ({ items }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {items.map(([k, v]) => (
      <div key={k} className="bg-slate-50 rounded-lg p-2.5">
        <div className="text-[11px] text-slate-500">{k}</div>
        <div className="text-sm font-semibold">{v}</div>
      </div>
    ))}
  </div>
);
