"use client";
import { LayoutDashboard, CheckSquare, Timer, Calendar, Zap } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Tasks", icon: <CheckSquare size={20} /> },
    { name: "Pomodoro", icon: <Timer size={20} /> },
    { name: "Schedule", icon: <Calendar size={20} /> },
    { name: "Cosmic Synths", icon: <Zap size={20} /> },
  ];

  return (
    <aside className="glass-panel" style={{ width: "250px", margin: "24px", padding: "24px", display: "flex", flexDirection: "column", position: "sticky", top: "24px", height: "calc(100vh - 48px)" }}>
      <h2 style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "28px" }}>
        agnishwar.ai
      </h2>
      <nav style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "12px", fontWeight: "500" }}>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px", 
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.2s",
              width: "100%",
              textAlign: "left",
              background: activeTab === item.name ? "rgba(99,102,241,0.1)" : "transparent",
              color: activeTab === item.name ? "var(--primary)" : "var(--text-secondary)"
            }}
            onMouseOver={(e) => {
              if (activeTab !== item.name) {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== item.name) {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span> {item.name}
          </button>
        ))}
      </nav>
      
      <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--border)", fontSize: "14px", color: "var(--text-secondary)", textAlign: "center" }}>
        Smart Study Workspace
      </div>
    </aside>
  );
}
