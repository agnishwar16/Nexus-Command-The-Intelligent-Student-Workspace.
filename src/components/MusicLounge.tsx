"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { Headphones, Music, Share2, Play, Pause, SkipForward, SkipBack, Users, Loader } from "lucide-react";
import { subscribeToRoom, broadcastState } from "@/lib/spotify-sync";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export default function MusicLounge() {
  const { data: session, status } = useSession();
  const [roomName, setRoomName] = useState("Study Session");
  const [participants, setParticipants] = useState<string[]>([]);
  
  // Spotify States
  const [player, setPlayer] = useState<any>(null);
  const [is_paused, setPaused] = useState(true);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sync Refs
  const channelRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (session?.user?.name) {
      setRoomName(`${session.user.name}'s Study Session`);
    }
  }, [session]);


  // Spotify removed - no longer used in this project

  const togglePlay = () => {
    if (player) player.togglePlay();
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="glass-panel" style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        <div style={{ padding: "20px", background: "rgba(99,102,241,0.1)", borderRadius: "50%", color: "var(--primary)" }}>
          <Music size={48} />
        </div>
        <h2 style={{ fontSize: "24px" }}>Welcome to the Study Lounge</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>Connect your Spotify account to sync music with other students in real-time.</p>
        <button 
          onClick={() => signIn("spotify")}
          className="glass-panel" 
          style={{ padding: "12px 32px", background: "var(--primary)", color: "white", fontWeight: "600", cursor: "pointer", border: "none" }}
        >
          Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
      <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "40px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <Headphones className="text-primary" /> {roomName}
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              {is_active ? "🟢 Synchronized & Active" : "🟠 Select 'Agnishwar.ai Study Lounge' in Spotify"}
            </p>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Invite link copied!");
            }}
            className="glass-panel" 
            style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}
          >
            <Share2 size={16} /> Copy Invite Link
          </button>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px", minHeight: "350px" }}>
          <div className="glass-panel" style={{ width: "260px", height: "260px", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            {!is_active ? (
              <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Music size={64} style={{ opacity: 0.2 }} />
              </div>
            ) : (
              <img 
                src={current_track?.album?.images[0]?.url} 
                alt="Album Art" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            {!is_paused && (
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 12, height: 12, background: "#1DB954", borderRadius: "50%", boxShadow: "0 0 10px #1DB954" }}></div>
            )}
          </div>
          
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>{current_track?.name || "Not Playing"}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "4px" }}>
              {current_track?.artists?.map((a: any) => a.name).join(", ") || "Connect your Spotify app"}
            </p>
          </div>

          <div style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${(progress / duration) * 100 || 0}%`, 
                  background: "var(--primary)",
                  transition: is_paused ? "none" : "width 1s linear"
                }} 
              ></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <button onClick={() => player?.previousTrack()} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <SkipBack size={32} />
            </button>
            <button 
              onClick={togglePlay}
              style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "var(--primary)", 
                border: "none", 
                color: "white", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
                transition: "transform 0.2s"
              }}
            >
              {is_paused ? <Play size={40} style={{ marginLeft: "4px" }} /> : <Pause size={40} />}
            </button>
            <button onClick={() => player?.nextTrack()} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <SkipForward size={32} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} /> In the Lounge
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "600" }}>
              {session?.user?.name?.[0] || "A"}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{session?.user?.name || "Member"} (You)</div>
              <div style={{ fontSize: "11px", color: "var(--primary)" }}>HOST</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Sync Mode:</span>
            <span style={{ color: "#1DB954", fontWeight: "600" }}>Real-time</span>
          </div>
          <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
            <div style={{ height: "100%", width: "100%", background: "#1DB954", opacity: 0.6 }}></div>
          </div>
          <p style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "12px", textAlign: "center" }}>
            Broadcasting via Supabase Realtime
          </p>
        </div>
      </div>
    </div>
  );
}
