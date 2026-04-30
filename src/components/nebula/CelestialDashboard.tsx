'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { NebulaBackground } from './NebulaBackground';
import { DataRain } from './DataRain';
import { BlackHole } from './BlackHole';
import TaskList from '../TaskList';
import PomodoroWidget from '../PomodoroWidget';
import AIAssistant from '../AIAssistant';
import AnalyticsWidget from '../AnalyticsWidget';
import CalendarWidget from '../CalendarWidget';
import { CelestialSynthesizer } from './CelestialSynthesizer';
import PilotIdentity from '../PilotIdentity';
import { Zap, Cpu, LogOut, Maximize2, Minimize2, X } from 'lucide-react';
import '@/app/celestial.css';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  id?: string;
  focusedWidget?: string | null;
  setFocusedWidget?: (id: string | null) => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ title, children, delay = 0, id, focusedWidget, setFocusedWidget }) => {
  const isFocused = focusedWidget === id;
  const isHidden = focusedWidget !== null && !isFocused;

  // Don't render if another widget is focused
  if (isHidden) return <div style={{ display: 'none' }} />;

  return (
    <>
      {isFocused && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 999 }} onClick={() => setFocusedWidget?.(null)} />
      )}
      <motion.div
        layout
        initial={!isFocused ? { opacity: 0, scale: 0.95, y: 20 } : false}
        animate={!isFocused ? { opacity: 1, scale: 1, y: 0 } : false}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          height: isFocused ? '80vh' : '100%', 
          pointerEvents: 'auto', 
          zIndex: isFocused ? 1000 : 10,
          background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.8) 0%, rgba(0, 5, 10, 0.9) 100%)',
          border: '1px solid rgba(0, 242, 255, 0.2)',
          boxShadow: 'inset 0 0 20px rgba(0, 242, 255, 0.05), 0 10px 30px rgba(0,0,0,0.5)',
          clipPath: isFocused ? 'none' : 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          borderRadius: isFocused ? '16px' : '0',
          padding: '24px',
          position: isFocused ? 'fixed' : 'relative',
          top: isFocused ? '10vh' : 'auto',
          left: isFocused ? '10vw' : 'auto',
          width: isFocused ? '80vw' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* High-tech corner accents (Only when not focused for cleaner look) */}
        {!isFocused && (
            <>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '2px', background: 'var(--hologram-cyan)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '30px', background: 'var(--hologram-cyan)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '2px', background: 'var(--hologram-purple)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '30px', background: 'var(--hologram-purple)' }} />
            </>
        )}

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
          <span className="cyber-text" style={{ letterSpacing: '3px', fontSize: isFocused ? '16px' : '11px', color: 'rgba(255,255,255,0.7)' }}>{title.toUpperCase()}</span>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {id && setFocusedWidget && (
                <button 
                    onClick={() => setFocusedWidget(isFocused ? null : id)}
                    style={{ background: 'none', border: 'none', color: 'var(--hologram-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                    title={isFocused ? "Minimize" : "Maximize"}
                >
                    {isFocused ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            )}
            {!isFocused && (
                <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '4px', height: '4px', background: 'var(--hologram-cyan)', boxShadow: '0 0 10px var(--hologram-cyan)' }} />
                    <div style={{ width: '4px', height: '4px', background: 'var(--hologram-cyan)', opacity: 0.5 }} />
                </div>
            )}
            {isFocused && (
                <button onClick={() => setFocusedWidget?.(null)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', pointerEvents: 'auto', paddingRight: '8px' }}>
          {children}
        </div>
      </motion.div>
    </>
  );
};

export default function CelestialDashboard() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [focusedWidget, setFocusedWidget] = useState<string | null>(null);

  useEffect(() => {
    // Listen for custom events triggered by child components
    const handleWidgetFocus = (e: any) => {
        if (e.detail && e.detail.widgetId) {
            setFocusedWidget(e.detail.widgetId);
        }
    };
    window.addEventListener('request-widget-focus', handleWidgetFocus);
    return () => window.removeEventListener('request-widget-focus', handleWidgetFocus);
  }, []);

  const updateStats = async () => {
    try {
        if (session?.user) {
            const userId = (session.user as any).id || session.user.email;
            console.log("Fetching stats from DB for ID:", userId);
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId);
            
            if (error) {
                console.error("Supabase Query Error:", error);
                throw new Error(error.message || "Unknown Supabase error");
            }

            if (data && data.length > 0) {
                const stats = data[0];
                console.log("Stats found in DB:", stats);
                setStreak(stats.streak_count || 0);
                setTotalMinutes(stats.total_focus_minutes || 0);
                setSessionMinutes(0);
                if (stats.weekly_progress) setWeeklyProgress(JSON.parse(stats.weekly_progress as string));
                return;
            } else {
                console.log("No stats found in DB for this user.");
            }
        }
    } catch (e: any) {
        console.error("CRITICAL: Failed to load stats from Supabase:", e);
        // Show more details if available
        if (e.message) console.error("Error Message:", e.message);
    }

    const savedStreak = localStorage.getItem('nebula_streak');
    const savedWeekly = localStorage.getItem('nebula_weekly');
    const savedMins = localStorage.getItem('nebula_total_mins');
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedWeekly) setWeeklyProgress(JSON.parse(savedWeekly));
    if (savedMins) {
        setTotalMinutes(parseInt(savedMins));
        setSessionMinutes(0);
    }
  };

  useEffect(() => {
    if (session?.user) {
      updateStats();
    }

    const handleMinutePulse = (e: any) => {
        if (e.detail && e.detail.amount) {
            setSessionMinutes(prev => prev + e.detail.amount);
        }
    };

    window.addEventListener('streakUpdated', updateStats);
    window.addEventListener('minutesPulse', handleMinutePulse);
    
    return () => {
        window.removeEventListener('streakUpdated', updateStats);
        window.removeEventListener('minutesPulse', handleMinutePulse);
    };
  }, [session]);

  const displayMinutes = totalMinutes + sessionMinutes;

  return (
    <div className="celestial-container" style={{ pointerEvents: 'none' }}>
      <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.15,
          mixBlendMode: 'overlay'
      }} />

      <motion.div 
        animate={{ opacity: [1, 0.98, 1, 0.95, 1] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatType: "reverse" }}
        style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 242, 255, 0.02)',
            zIndex: 9998,
            pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <DataRain />
        <div className="nebula-vortex" style={{ pointerEvents: 'none' }} />
        <NebulaBackground />
      </div>
      
      <main style={{ 
        position: 'relative', 
        zIndex: 100, 
        padding: '4rem 2rem', 
        maxWidth: '1400px', 
        margin: '0 auto',
        pointerEvents: 'auto'
      }}>
        
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <span className="cyber-text">System Status: Optimal</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 700, margin: '0.5rem 0', textTransform: 'uppercase', letterSpacing: '4px' }}>Nexus Command</h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Agnishwar's command interface for academic excellence.</p>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.2rem' }}
          >
            <PilotIdentity />
            
            <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="cyber-text" style={{ fontSize: '9px', color: 'var(--hologram-cyan)', letterSpacing: '2px', marginBottom: '6px' }}>NEURAL STREAK</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1], 
                                filter: ['drop-shadow(0 0 2px var(--hologram-cyan))', 'drop-shadow(0 0 8px var(--hologram-cyan))', 'drop-shadow(0 0 2px var(--hologram-cyan))'] 
                            }} 
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Zap size={20} fill="var(--hologram-cyan)" style={{ color: 'var(--hologram-cyan)' }} />
                        </motion.div>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 15px rgba(0,242,255,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {streak} <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 'normal', letterSpacing: '2px' }}>DAYS</span>
                        </span>
                    </div>
                </div>

                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

                <button 
                    onClick={() => updateStats()}
                    className="hover-scale"
                    style={{ 
                        background: 'rgba(0, 242, 255, 0.1)', 
                        border: '1px solid rgba(0, 242, 255, 0.3)', 
                        color: 'var(--hologram-cyan)', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        fontSize: '9px', 
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--hologram-cyan)', borderRadius: '50%', boxShadow: '0 0 5px var(--hologram-cyan)' }} />
                        SYNC
                    </div>
                </button>
            </div>
          </motion.div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <WidgetContainer title="Temporal Rift (Tasks)" delay={0.1} id="tasks" focusedWidget={focusedWidget} setFocusedWidget={setFocusedWidget}>
              <TaskList />
            </WidgetContainer>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <WidgetContainer title="Focus Flux" delay={0.2} id="pomodoro" focusedWidget={focusedWidget} setFocusedWidget={setFocusedWidget}>
                <PomodoroWidget />
              </WidgetContainer>
              <WidgetContainer title="Celestial Synthesizer" delay={0.3} id="music" focusedWidget={focusedWidget} setFocusedWidget={setFocusedWidget}>
                <CelestialSynthesizer />
              </WidgetContainer>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
             {/* Central Hub Mini: User Core (Restored to BlackHole to fix 3D Crash) */}
            <div style={{ position: 'relative', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, border: '1px dashed rgba(0, 242, 255, 0.2)', borderRadius: '50%', animation: 'spin 20s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '40px', border: '1px solid rgba(188, 19, 254, 0.1)', borderRadius: '50%', animation: 'spin 15s linear reverse infinite' }} />
                <div style={{ scale: 0.8, pointerEvents: 'auto' }}>
                    <BlackHole avatarUrl={session?.user?.image || "https://api.dicebear.com/7.x/bottts/svg?seed=Codex"} xpProgress={0.75} />
                </div>
            </div>

            <WidgetContainer title="Neural Link (AI Assistant)" delay={0.4} id="ai" focusedWidget={focusedWidget} setFocusedWidget={setFocusedWidget}>
              <AIAssistant />
            </WidgetContainer>

            <WidgetContainer title="Chronos Map" delay={0.5} id="calendar" focusedWidget={focusedWidget} setFocusedWidget={setFocusedWidget}>
              <CalendarWidget />
            </WidgetContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
