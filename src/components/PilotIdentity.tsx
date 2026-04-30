'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, LogOut, ShieldCheck, Cpu } from "lucide-react";

export default function PilotIdentity() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="cyber-text" style={{ fontSize: '10px', opacity: 0.5 }}>
        Authenticating...
      </div>
    );
  }

  if (session) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            background: 'rgba(255,255,255,0.03)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 242, 255, 0.1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'right' }}>
            <div className="cyber-text" style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>
                {session.user?.name?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                <ShieldCheck size={10} color="var(--hologram-cyan)" />
                <span style={{ fontSize: '8px', color: 'var(--hologram-cyan)', letterSpacing: '1px' }}>COMMAND PILOT</span>
            </div>
        </div>
        
        <div style={{ position: 'relative' }}>
            <img 
                src={session.user?.image || "https://api.dicebear.com/7.x/bottts/svg?seed=Codex"} 
                alt="Pilot" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--hologram-cyan)', boxShadow: '0 0 10px rgba(0,242,255,0.3)' }}
            />
            <button 
                onClick={() => signOut()}
                style={{ 
                    position: 'absolute', 
                    bottom: '-5px', 
                    right: '-5px', 
                    background: '#ff4d4d', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                }}
            >
                <LogOut size={10} />
            </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signIn("google")}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        background: 'rgba(0, 242, 255, 0.1)',
        border: '1px solid rgba(0, 242, 255, 0.3)',
        borderRadius: '30px',
        color: '#00f2ff',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)'
      }}
    >
      <LogOut size={14} style={{ transform: 'rotate(180deg)' }} />
      LOGIN
    </motion.button>
  );
}
