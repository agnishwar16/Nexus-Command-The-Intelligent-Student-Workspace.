'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Radio, Sparkles } from 'lucide-react';

const STATIONS = [
  { id: '1', name: 'NEURAL NODE - LOFI STUDY', videoId: 'jfKfPfyJRdk' },
  { id: '2', name: 'CYBER-STREETS - SYNTHWAVE', videoId: '4xDzrJKXOOY' },
  { id: '3', name: 'ORBITAL STATION - DEEP SPACE', videoId: 'Y_plhk1FUQA' },
  { id: '4', name: 'VOID DRIFT - INTERSTELLAR', videoId: '17lotd0HYCw' },
  { id: '5', name: 'RAINY CAFE - JAZZ VIBES', videoId: 'NJuSStkIZBg' }
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const CelestialSynthesizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentStation = STATIONS[trackIndex];

  // Load YouTube Iframe API
  useEffect(() => {
    setMounted(true);
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
        if (playerRef.current) {
            playerRef.current.destroy();
        }
    };
  }, []);

  const createPlayer = () => {
    playerRef.current = new window.YT.Player('yt-player-anchor', {
      height: '100%',
      width: '100%',
      videoId: STATIONS[trackIndex].videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        enablejsapi: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : ''
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
        },
        onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
        }
      }
    });
  };

  // Sync state changes to the player
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      // Small timeout to let the player reset its internal state
      const timer = setTimeout(() => {
        playerRef.current.loadVideoById({
          videoId: currentStation.videoId,
          startSeconds: 0,
          suggestedQuality: 'default'
        });
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        if (isPlaying) playerRef.current.playVideo();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [trackIndex]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (isPlaying) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % STATIONS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + STATIONS.length) % STATIONS.length);
    setIsPlaying(true);
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      
      {/* Immersive Video Area - Rectangle Optimized */}
      <div 
        style={{ 
            position: 'relative', 
            flex: 1,
            minHeight: '260px', 
            width: '100%', 
            background: '#000', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: `1px solid ${isPlaying ? 'var(--hologram-cyan)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: isPlaying ? '0 0 30px rgba(0, 242, 255, 0.2)' : 'none',
            transition: 'all 0.5s ease'
        }}
      >
        {/* The 'Anchor' div that YouTube will turn into an iframe */}
        <div id="yt-player-anchor" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        
        {/* Holographic Overlay */}
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('request-widget-focus', { detail: { widgetId: 'music' } }))}
          style={{ 
            position: 'absolute', 
            inset: 0,
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px', 
            background: isPlaying ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)' : 'rgba(0,0,0,0.6)',
            cursor: 'pointer',
            zIndex: 5,
            pointerEvents: isPlaying ? 'none' : 'auto'
          }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Radio size={14} color={isPlaying ? 'var(--hologram-cyan)' : '#888'} className={isPlaying ? "animate-pulse" : ""} />
                    <span className="cyber-text" style={{ fontSize: '9px', color: isPlaying ? 'var(--hologram-cyan)' : '#888' }}>
                        {isPlaying ? "UPLINK LIVE" : "SIGNAL STANDBY"}
                    </span>
                </div>
                <Sparkles size={14} style={{ opacity: isPlaying ? 0.6 : 0.1, color: 'var(--hologram-cyan)' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                {!isPlaying && <span className="cyber-text" style={{ fontSize: '10px', letterSpacing: '4px', opacity: 0.5 }}>READY TO TRANSMIT</span>}
            </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <div>
            <h3 className="cyber-text" style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{currentStation.name}</h3>
            <p className="cyber-text" style={{ fontSize: '9px', opacity: 0.4 }}>GLOBAL FREQUENCY CHANNEL {trackIndex + 1}</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><SkipBack size={20} /></button>
            <button
                onClick={togglePlay}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: isPlaying ? 'transparent' : 'rgba(0, 242, 255, 0.1)',
                    border: `1px solid ${isPlaying ? 'var(--hologram-cyan)' : 'rgba(0,242,255,0.3)'}`,
                    color: isPlaying ? 'var(--hologram-cyan)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
            <button onClick={handleNext} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><SkipForward size={20} /></button>
        </div>
      </div>

      {/* Real Volume Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Volume2 size={16} style={{ color: isPlaying ? 'var(--hologram-cyan)' : 'rgba(255,255,255,0.3)' }} />
        <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(parseInt(e.target.value))}
            style={{ 
                flex: 1, 
                accentColor: 'var(--hologram-cyan)', 
                height: '4px', 
                cursor: 'pointer'
            }} 
        />
        <span className="cyber-text" style={{ fontSize: '10px', width: '30px', opacity: 0.5 }}>{volume}%</span>
      </div>
    </div>
  );
};

