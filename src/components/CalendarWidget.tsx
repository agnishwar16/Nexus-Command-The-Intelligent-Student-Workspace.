import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  category: string;
}

export default function CalendarWidget() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = async () => {
    if (!session || !(session as any).accessToken) {
      setError("Please sign in again to grant Calendar permissions.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get start and end of the selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
            setError("Session Expired: Please click 'SYNC GOOGLE' to refresh your connection.");
            return;
        }
        if (response.status === 403) {
            setError("Permission Denied: Please log out, log in, and check the Calendar box.");
            return;
        }
        console.error("Calendar API Error:", errorText);
        setError("Failed to fetch calendar. Please try again.");
        return;
      }

      const data = JSON.parse(await response.text() || "{}");
      
      const formattedEvents: CalendarEvent[] = (data.items || []).map((item: any) => {
        let timeString = "All Day";
        if (item.start?.dateTime) {
            const start = new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const end = new Date(item.end?.dateTime || item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeString = `${start} - ${end}`;
        }

        return {
          id: item.id,
          title: item.summary || "Busy",
          time: timeString,
          category: item.colorId === "11" ? "Meeting" : "Academic" // Basic mapping
        };
      });

      setEvents(formattedEvents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCalendarEvents();
    }
  }, [selectedDate, session]);

  // Simple calendar generator for the current month
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const handleSyncClick = () => {
    if (!session || !(session as any).accessToken || error) {
        signIn("google", { callbackUrl: "/" });
    } else {
        fetchCalendarEvents();
    }
  };

  return (
    <section className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <h3 style={{ fontSize: "20px" }}>Google Calendar</h3>
        <button 
            onClick={handleSyncClick}
            disabled={loading}
            style={{ 
                background: "var(--hologram-cyan)", 
                color: "black", 
                padding: "8px 16px", 
                borderRadius: "8px", 
                border: "none", 
                fontSize: "12px", 
                fontWeight: "600", 
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 0 10px rgba(0, 242, 255, 0.3)"
            }}
        >
          {loading ? "SYNCING..." : "SYNC GOOGLE"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
        {/* Simple Date Grid */}
        <div>
          <div style={{ textAlign: "center", marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={`day-${i}`} style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "bold" }}>{d}</div>
            ))}
            {padding.map((_, i) => <div key={`p-${i}`} />)}
            {days.map(d => (
              <div key={d} style={{ 
                fontSize: "14px", 
                padding: "8px", 
                borderRadius: "8px", 
                background: d === selectedDate.getDate() ? "var(--hologram-cyan)" : "transparent",
                color: d === selectedDate.getDate() ? "black" : "var(--text-primary)",
                cursor: "pointer",
                fontWeight: d === selectedDate.getDate() ? "bold" : "normal",
                transition: "all 0.2s"
              }}
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(d);
                setSelectedDate(newDate);
              }}
              onMouseOver={e => d !== selectedDate.getDate() && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseOut={e => d !== selectedDate.getDate() && (e.currentTarget.style.background = "transparent")}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Events for {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}</h4>
          
          {error && (
            <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#ff4d4d", fontSize: "12px" }}>
                {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "200px", overflowY: "auto" }}>
            {events.length === 0 && !loading && !error && (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>No events scheduled.</div>
            )}
            
            {events.map(event => (
              <div key={event.id} style={{ 
                padding: "12px", 
                borderRadius: "12px", 
                background: "rgba(255,255,255,0.03)", 
                border: "1px solid var(--border)",
                borderLeft: `3px solid var(--hologram-cyan)`
              }}>
                <div style={{ fontWeight: "600", fontSize: "13px" }}>{event.title}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
