'use client';
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export default function PomodoroWidget() {
  const { data: session } = useSession();
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"Focus" | "Break">("Focus");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [lastSyncedMinute, setLastSyncedMinute] = useState(0);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
            const next = prev - 1;
            
            // Live Sync Pulse: Every minute that passes, dispatch a live update
            const secondsPassed = (focusTime * 60) - next;
            const currentMinute = Math.floor(secondsPassed / 60);

            if (mode === "Focus" && next > 0 && secondsPassed % 60 === 0 && currentMinute > lastSyncedMinute) {
                setLastSyncedMinute(currentMinute);
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('minutesPulse', { detail: { amount: 1 } }));
                }, 0);
            }
            
            return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleModeSwitch();
      setLastSyncedMinute(0); // Reset for next session
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleModeSwitch = async () => {
    setIsRunning(false);
    
    if (mode === "Focus") {
        const today = new Date().toLocaleDateString();
        const lastStreakDate = localStorage.getItem('nebula_last_streak_date');
        const sessionMins = focusTime;

        // 1. Sync to LocalStorage (Fallback)
        const currentTotal = parseInt(localStorage.getItem('nebula_total_mins') || '0');
        localStorage.setItem('nebula_total_mins', (currentTotal + sessionMins).toString());

        if (lastStreakDate !== today) {
            const currentStreak = parseInt(localStorage.getItem('nebula_streak') || '12');
            localStorage.setItem('nebula_streak', (currentStreak + 1).toString());
            localStorage.setItem('nebula_last_streak_date', today);
            
            const weeklyProgress = JSON.parse(localStorage.getItem('nebula_weekly') || '[1,1,1,1,1,0,0]');
            const dayOfWeek = (new Date().getDay() + 6) % 7;
            weeklyProgress[dayOfWeek] = 1;
            localStorage.setItem('nebula_weekly', JSON.stringify(weeklyProgress));
        }

        // 2. Sync to Supabase (Primary)
        if (session?.user) {
            const userId = (session.user as any).id || session.user.email;
            if (!userId) return;

            // Increment Career Minutes and Update Streak
            const syncStats = async () => {
                try {
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Get current stats first to calculate new totals
                    const { data: current, error: fetchError } = await supabase
                        .from('user_stats')
                        .select('*')
                        .eq('user_id', userId)
                        .maybeSingle();

                    if (fetchError) throw fetchError;

                    const newTotalMins = (current?.total_focus_minutes || 0) + sessionMins;
                    
                    // Streak Logic: Only increment if the last sync wasn't today
                    const isNewDay = !current?.last_streak_date || current.last_streak_date !== today;
                    const currentStreak = current?.streak_count || 0;
                    const newStreak = isNewDay ? currentStreak + 1 : currentStreak;

                    console.log("💾 PERSISTENCE UPLINK: Syncing for ", userId);

                    const { error: upsertError } = await supabase
                        .from('user_stats')
                        .upsert({ 
                            user_id: userId,
                            total_focus_minutes: newTotalMins,
                            streak_count: Math.max(1, newStreak),
                            last_streak_date: today,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });
                    
                    if (upsertError) throw upsertError;
                    console.log("✅ STREAK SECURED IN CLOUD");
                    
                    window.dispatchEvent(new Event('streakUpdated'));
                } catch (error) {
                    console.error("❌ PERSISTENCE FAILURE:", error);
                }
            };
            
            syncStats();
        }

        window.dispatchEvent(new Event('streakUpdated'));
    }

    const nextMode = mode === "Focus" ? "Break" : "Focus";
    setMode(nextMode);
    setTimeLeft(nextMode === "Focus" ? focusTime * 60 : breakTime * 60);
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "Focus" ? focusTime * 60 : breakTime * 60);
  };

  const setDuration = (mins: number) => {
    setIsRunning(false);
    if (mode === "Focus") {
        setFocusTime(mins);
        setTimeLeft(mins * 60);
    } else {
        setBreakTime(mins);
        setTimeLeft(mins * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = mode === "Focus" ? focusTime * 60 : breakTime * 60;
  const progress = (timeLeft / totalTime) * 100;
  
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%", justifyContent: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} color={mode === "Focus" ? "var(--hologram-cyan)" : "var(--hologram-purple)"} className={isRunning ? "animate-pulse" : ""} />
            <h3 className="cyber-text" style={{ fontSize: "11px", letterSpacing: "2px", color: mode === "Focus" ? "var(--hologram-cyan)" : "var(--hologram-purple)" }}>
                {mode === "Focus" ? "NEURAL SYNC" : "RECOVERY UPLINK"}
            </h3>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => { setMode("Focus"); setTimeLeft(focusTime * 60); setIsRunning(false); }} className="hover-scale" style={{ padding: "4px 10px", fontSize: "8px", borderRadius: "4px", background: mode === "Focus" ? "rgba(0, 242, 255, 0.1)" : "transparent", color: mode === "Focus" ? "#00f2ff" : "rgba(255,255,255,0.3)", border: mode === "Focus" ? "1px solid rgba(0, 242, 255, 0.3)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: 'uppercase' }}>Focus</button>
            <button onClick={() => { setMode("Break"); setTimeLeft(breakTime * 60); setIsRunning(false); }} className="hover-scale" style={{ padding: "4px 10px", fontSize: "8px", borderRadius: "4px", background: mode === "Break" ? "rgba(188, 19, 254, 0.1)" : "transparent", color: mode === "Break" ? "#bc13fe" : "rgba(255,255,255,0.3)", border: mode === "Break" ? "1px solid rgba(188, 19, 254, 0.3)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: 'uppercase' }}>Break</button>
        </div>
      </div>

      {/* Main Large Timer Ring */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle 
                cx="110" cy="110" r="100" 
                fill="none" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="4" 
            />
            {/* Pulsing Outer Glow */}
            <circle 
                cx="110" cy="110" r="100" 
                fill="none" 
                stroke={mode === "Focus" ? "rgba(0, 242, 255, 0.05)" : "rgba(188, 19, 254, 0.05)"} 
                strokeWidth="12" 
                style={{ filter: 'blur(8px)' }}
            />
            {/* Main Progress Ring */}
            <circle 
                cx="110" cy="110" r="100" 
                fill="none" 
                stroke={mode === "Focus" ? "var(--hologram-cyan)" : "var(--hologram-purple)"} 
                strokeWidth="4" 
                strokeDasharray="628" 
                strokeDashoffset={628 - (628 * progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 5px ${mode === "Focus" ? "rgba(0,242,255,0.5)" : "rgba(188,19,254,0.5)"})` }}
            />
            {/* Decorative Ticks */}
            {[...Array(12)].map((_, i) => (
                <rect 
                    key={i}
                    x="205" y="109" width="10" height="2"
                    fill="rgba(255,255,255,0.1)"
                    style={{ transformOrigin: '110px 110px', transform: `rotate(${i * 30}deg)` }}
                />
            ))}
        </svg>

        {/* Time Display */}
        <div style={{ 
            position: 'absolute',
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <div style={{ 
                fontSize: "48px", 
                fontWeight: "200", 
                color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "-2px",
                textShadow: `0 0 20px ${mode === "Focus" ? "rgba(0, 242, 255, 0.3)" : "rgba(188, 19, 254, 0.3)"}`
            }}>
                {minutes.toString().padStart(2, "0")}<span style={{ opacity: isRunning ? [0.2, 1][Math.floor(Date.now()/500)%2] : 1 }}>:</span>{seconds.toString().padStart(2, "0")}
            </div>
            <div className="cyber-text" style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", marginTop: "-5px", letterSpacing: "3px" }}>
                {isRunning ? "PROCESS ACTIVE" : "SYSTEM STANDBY"}
            </div>
        </div>
      </div>

      {/* Preset Selection (Advanced Grid) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {(mode === "Focus" ? [30, 60, 120] : [5, 15, 60]).map(m => (
            <button 
                key={m} 
                onClick={() => setDuration(m)} 
                style={{ 
                    padding: "8px", 
                    fontSize: "10px", 
                    borderRadius: "8px", 
                    background: (mode === "Focus" ? focusTime : breakTime) === m ? "rgba(255,255,255,0.05)" : "transparent", 
                    color: (mode === "Focus" ? focusTime : breakTime) === m ? (mode === "Focus" ? "var(--hologram-cyan)" : "var(--hologram-purple)") : "rgba(255,255,255,0.3)", 
                    border: `1px solid ${(mode === "Focus" ? focusTime : breakTime) === m ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                    cursor: "pointer",
                    transition: 'all 0.2s'
                }}
            >
                {m >= 60 ? `${m/60}H` : `${m}M`}
            </button>
        ))}
      </div>
      
      {/* Primary Controls */}
      <div style={{ display: "flex", gap: "12px", marginTop: 'auto' }}>
        <button 
            onClick={toggleTimer} 
            className="hover-scale"
            style={{ 
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                background: isRunning ? "rgba(255,255,255,0.05)" : (mode === "Focus" ? "var(--hologram-cyan)" : "var(--hologram-purple)"),
                border: "none",
                color: isRunning ? "#fff" : "#000",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: isRunning ? "none" : `0 0 20px ${mode === "Focus" ? "rgba(0, 242, 255, 0.3)" : "rgba(188, 19, 254, 0.3)"}`,
                transition: 'all 0.3s'
            }}
        >
          {isRunning ? <><Pause size={16} fill="currentColor" /> PAUSE SESSION</> : <><Play size={16} fill="currentColor" /> INITIATE SYNC</>}
        </button>
        <button 
            onClick={resetTimer} 
            className="hover-scale"
            style={{ 
                width: "54px", 
                borderRadius: "12px", 
                background: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                color: "rgba(255,255,255,0.5)", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
            }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </section>
  );
}
