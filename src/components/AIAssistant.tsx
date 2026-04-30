"use client";
import { useRef, useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Loader } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init-1", role: "assistant", content: "Hi Agnishwar! I'm your AI Assistant. I can help you break down large assignments into smaller tasks or generate a study schedule. What are you working on today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";
      const assistantMessageId = (Date.now() + 1).toString();

      // Create a placeholder for the assistant response
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('0:')) {
              try {
                const jsonStr = trimmed.substring(2);
                const text = JSON.parse(jsonStr);
                assistantMessageContent += text;
                setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m));
              } catch (e) {
                console.warn("Partial or malformed chunk ignored:", trimmed);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Please check your internet or API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-panel" style={{ padding: "0", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={20} style={{ color: "var(--primary)" }} />
          <span>Agnishwar.ai Assistant</span>
        </h3>
        {isLoading && <Loader size={18} className="animate-spin" style={{ color: "var(--primary)", animation: "spin 2s linear infinite" }} />}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: msg.role === "user" ? "var(--primary)" : "rgba(255,255,255,0.05)",
            color: msg.role === "user" ? "#fff" : "var(--text-primary)",
            padding: "16px",
            borderRadius: "16px",
            borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
            borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px",
            border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
            boxShadow: msg.role === "user" ? "0 4px 12px rgba(99,102,241,0.15)" : "none"
          }}>
            {msg.content === "" && msg.role === 'assistant' ? (
              <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
                <div className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                <div className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "pulse 1.5s infinite 0.2s" }} />
                <div className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "pulse 1.5s infinite 0.4s" }} />
              </div>
            ) : (
              <div className={msg.role === 'assistant' ? 'ai-markdown' : ''} style={{ fontSize: "15px", lineHeight: "1.6" }}>
                {msg.role === 'user' ? (
                  msg.content.split('\n').map((line, i) => <p key={i} style={{ margin: i > 0 ? "8px 0 0 0" : 0 }}>{line}</p>)
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onSend} style={{ padding: "20px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px", background: "rgba(0,0,0,0.15)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => window.dispatchEvent(new CustomEvent('request-widget-focus', { detail: { widgetId: 'ai' } }))}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "14px",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-primary)",
            outline: "none",
            fontSize: "15px",
            transition: "all 0.2s"
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            background: input.trim() ? "var(--primary)" : "rgba(255,255,255,0.05)",
            color: "#fff",
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: input.trim() && !isLoading ? "pointer" : "default",
            transition: "all 0.2s",
            opacity: input.trim() ? 1 : 0.5
          }}
        >
          <Send size={20} />
        </button>
      </form>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
