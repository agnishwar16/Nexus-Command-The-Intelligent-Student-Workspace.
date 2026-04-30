"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PomodoroWidget from "@/components/PomodoroWidget";
import TaskList from "@/components/TaskList";
import AIAssistant from "@/components/AIAssistant";
import AnalyticsWidget from "@/components/AnalyticsWidget";
import CalendarWidget from "@/components/CalendarWidget";
import NebulaDashboard from "@/components/nebula/NebulaDashboard";
import { CourseMonolith } from "@/components/nebula/CourseMonolith";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MusicLounge = dynamic(() => import("@/components/MusicLounge"), { 
  ssr: false,
  loading: () => <div className="glass-panel" style={{ padding: "48px", textAlign: "center" }}>Loading Study Lounge...</div>
});

import CelestialDashboard from "@/components/nebula/CelestialDashboard";

export default function Home() {
  const [isLegacy, setIsLegacy] = useState(false);

  if (isLegacy) {
    return (
      <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: '#03000a', color: 'white' }}>
        <Sidebar activeTab="Dashboard" setActiveTab={() => {}} />
        <main style={{ flex: 1, padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
          <header style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "700" }}>Legacy Dashboard</h1>
            <button 
              onClick={() => setIsLegacy(false)}
              style={{ marginTop: '1rem', background: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
            >
              Restore Celestial Interface
            </button>
          </header>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <PomodoroWidget />
              <TaskList />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <AnalyticsWidget />
              <AIAssistant />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <CelestialDashboard />
      <button 
        onClick={() => setIsLegacy(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "8px 16px",
          borderRadius: "30px",
          color: "rgba(255,255,255,0.4)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: "pointer",
          zIndex: 100,
          backdropFilter: "blur(10px)"
        }}
      >
        Legacy Mode
      </button>
    </>
  );
}
