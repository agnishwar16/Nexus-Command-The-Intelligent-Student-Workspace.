"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";

const intensityData = [
  { day: "Mon", minutes: 120 },
  { day: "Tue", minutes: 180 },
  { day: "Wed", minutes: 90 },
  { day: "Thu", minutes: 210 },
  { day: "Fri", minutes: 150 },
  { day: "Sat", minutes: 60 },
  { day: "Sun", minutes: 240 },
];

const subjectData = [
  { subject: "AI ML", hours: 12, color: "#6366f1" },
  { subject: "Data Sci", hours: 8, color: "#10b981" },
  { subject: "Math", hours: 4, color: "#f59e0b" },
  { subject: "Coding", hours: 15, color: "#a855f7" },
];

export default function AnalyticsWidget() {
  return (
    <section className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "40px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "20px" }}>Study Intensity</h3>
          <span style={{ fontSize: "14px", color: "var(--accent)", fontWeight: "600", background: "rgba(16, 185, 129, 0.1)", padding: "4px 12px", borderRadius: "12px" }}>+25% activity</span>
        </div>
        
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intensityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "rgba(30, 41, 59, 0.9)", border: "1px solid var(--border)", borderRadius: "12px", color: "#fff", backdropFilter: "blur(8px)" }}
                itemStyle={{ color: "var(--primary)", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="minutes" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "20px" }}>Subject Breakdown</h3>
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Total: 39 Hours</span>
        </div>
        
        <div style={{ width: "100%", height: "180px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="subject" type="category" stroke="var(--text-primary)" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: "rgba(30, 41, 59, 0.9)", border: "1px solid var(--border)", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={20}>
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
