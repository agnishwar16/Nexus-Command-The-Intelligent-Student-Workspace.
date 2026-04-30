"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  course?: string;
  deadline?: string;
  priority?: 'High' | 'Medium' | 'Low';
  user_id?: string;
  progress?: number; // Added progress field
}

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const [isLoaded, setIsLoaded] = useState(false);

  const userId = session?.user ? ((session.user as any).id || session.user.email) : null;

  const fetchTasks = async () => {
    if (!userId) return;

    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (data && !error && data.length > 0) {
          // Merge with local progress because Supabase schema might not have the progress column yet
          const saved = localStorage.getItem(`agnishwar_tasks_${userId}`);
          const savedTasks = saved ? JSON.parse(saved) : [];
          
          const merged = data.map((dbTask: any) => {
              const local = savedTasks.find((t: any) => t.id === dbTask.id);
              return { ...dbTask, progress: local?.progress || 0 };
          });
          setTasks(merged);
        } else {
          const saved = localStorage.getItem(`agnishwar_tasks_${userId}`);
          if (saved) setTasks(JSON.parse(saved));
        }
    } catch (e) {
        const saved = localStorage.getItem(`agnishwar_tasks_${userId}`);
        if (saved) setTasks(JSON.parse(saved));
    } finally {
        setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (userId) {
        fetchTasks();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && isLoaded) {
        localStorage.setItem(`agnishwar_tasks_${userId}`, JSON.stringify(tasks));
    }
  }, [tasks, userId, isLoaded]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !userId) return;

    const taskObj: Task = { 
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), 
      user_id: userId,
      title: newTask, 
      completed: false,
      course: "General",
      deadline: newDeadline || "No Date",
      priority: newPriority,
      progress: 0
    };

    setTasks([taskObj, ...tasks]);
    setNewTask("");
    setNewDeadline("");
    setNewPriority('Medium');

    try {
      // Omit progress for Supabase insertion to avoid schema errors
      const { progress, ...dbTask } = taskObj;
      const { error } = await supabase.from('tasks').insert([dbTask]);
      if (error) throw error;
    } catch (e) {
      console.error("CRITICAL: Supabase task sync failed for Gmail ID:", userId, e);
    }
  };

  const toggleTask = async (id: string, forceStatus?: boolean) => {
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;
    
    const newCompleted = forceStatus !== undefined ? forceStatus : !taskToToggle.completed;
    const newProgress = newCompleted ? 100 : taskToToggle.progress;

    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: newCompleted, progress: newProgress } : t
    );
    
    setTasks(updatedTasks);
    try {
      await supabase.from('tasks').update({ completed: newCompleted }).eq('id', id);
    } catch (e) {}
  };

  const updateProgress = (id: string, progress: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const isCompleted = progress === 100;
        // If they slide to 100%, mark as complete in DB too.
        if (isCompleted !== t.completed) {
            toggleTask(id, isCompleted);
        }
        return { ...t, progress, completed: isCompleted };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch (e) {}
  };

  const getPriorityStyles = (p?: string) => {
    switch (p) {
      case 'High': return { color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.1)', border: 'rgba(255, 77, 77, 0.3)' };
      case 'Medium': return { color: '#ffad33', bg: 'rgba(255, 173, 51, 0.1)', border: 'rgba(255, 173, 51, 0.3)' };
      case 'Low': return { color: '#33ff99', bg: 'rgba(51, 255, 153, 0.1)', border: 'rgba(51, 255, 153, 0.3)' };
      default: return { color: '#fff', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const filteredTasks = tasks.filter(t => activeTab === 'active' ? !t.completed : t.completed);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "12px" }}>
            <button 
                onClick={() => setActiveTab('active')}
                style={{ 
                    background: activeTab === 'active' ? 'rgba(0, 242, 255, 0.15)' : 'transparent',
                    border: activeTab === 'active' ? '1px solid rgba(0, 242, 255, 0.4)' : '1px solid transparent',
                    color: activeTab === 'active' ? 'var(--hologram-cyan)' : 'rgba(255,255,255,0.4)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                }}
            >
                ACTIVE ({tasks.filter(t => !t.completed).length})
            </button>
            <button 
                onClick={() => setActiveTab('completed')}
                style={{ 
                    background: activeTab === 'completed' ? 'rgba(188, 19, 254, 0.15)' : 'transparent',
                    border: activeTab === 'completed' ? '1px solid rgba(188, 19, 254, 0.4)' : '1px solid transparent',
                    color: activeTab === 'completed' ? 'var(--hologram-purple)' : 'rgba(255,255,255,0.4)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                }}
            >
                ARCHIVE ({tasks.filter(t => t.completed).length})
            </button>
        </div>
      </div>

      {activeTab === 'active' && (
          <form onSubmit={addTask} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid rgba(0,242,255,0.1)" }}>
            <input 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onFocus={() => window.dispatchEvent(new CustomEvent('request-widget-focus', { detail: { widgetId: 'tasks' } }))}
              placeholder="Initialize new objective..."
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#fff", outline: "none", fontSize: "13px" }}
            />
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    style={{ flex: 1.5, padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.6)", fontSize: "11px", outline: "none" }}
                />
                <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.8)", fontSize: "11px", outline: "none", cursor: "pointer" }}
                >
                    <option value="High" style={{ background: "#111" }}>High Prio</option>
                    <option value="Medium" style={{ background: "#111" }}>Mid Prio</option>
                    <option value="Low" style={{ background: "#111" }}>Low Prio</option>
                </select>
                <button type="submit" style={{ background: "var(--hologram-cyan)", color: "#000", width: "34px", height: "34px", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(0, 242, 255, 0.4)", fontWeight: "bold" }}>
                    <Plus size={18} />
                </button>
            </div>
          </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredTasks.map(task => {
          const pStyle = getPriorityStyles(task.priority);
          return (
            <div key={task.id} style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "8px", 
              padding: "12px 16px", 
              background: "rgba(255,255,255,0.02)", 
              borderRadius: "10px", 
              border: "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Background Progress Bar Fill */}
              <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: `${task.progress || 0}%`,
                  background: activeTab === 'completed' ? 'rgba(188, 19, 254, 0.05)' : 'rgba(0, 242, 255, 0.05)',
                  transition: 'width 0.3s ease',
                  zIndex: 0
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
                  <button onClick={() => toggleTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: task.completed ? "var(--hologram-purple)" : "rgba(255,255,255,0.2)" }}>
                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "rgba(255,255,255,0.3)" : "#fff", fontSize: "14px", fontWeight: "bold" }}>
                      {task.title}
                    </span>
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "10px" }}>
                      <span style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}`, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {task.priority || 'Medium'}
                      </span>
                      {task.deadline && task.deadline !== "No Date" && (
                        <span style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", padding: "2px 8px", borderRadius: "4px" }}>
                          📅 {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239, 68, 68, 0.2)" }} onMouseOver={e => e.currentTarget.style.color = "rgba(239, 68, 68, 0.6)"} onMouseOut={e => e.currentTarget.style.color = "rgba(239, 68, 68, 0.2)"}>
                    <Trash2 size={16} />
                  </button>
              </div>

              {/* Progress Slider */}
              {!task.completed && (
                  <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', minWidth: '40px' }}>{task.progress || 0}%</span>
                      <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={task.progress || 0}
                          onChange={(e) => updateProgress(task.id, parseInt(e.target.value))}
                          style={{
                              flex: 1,
                              height: '4px',
                              WebkitAppearance: 'none',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '2px',
                              outline: 'none',
                              cursor: 'pointer'
                          }}
                          className="cyber-slider"
                      />
                  </div>
              )}
            </div>
          );
        })}
      </div>
       {filteredTasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", filter: "grayscale(1)" }}>{activeTab === 'active' ? "📡" : "🗄️"}</div>
            <p style={{ fontSize: "12px", letterSpacing: "1px" }}>
                {activeTab === 'active' ? "NO ACTIVE MISSIONS" : "ARCHIVE EMPTY"}
            </p>
          </div>
        )}
    </section>
  );
}
