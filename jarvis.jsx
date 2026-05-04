import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), an advanced AI assistant. You speak in a refined, sophisticated, slightly formal British style — like Tony Stark's AI butler. You are helpful, witty, and occasionally make subtle dry humor. Keep responses concise but insightful. Address the user as "sir" or "ma'am" occasionally. You can respond in the same language the user speaks (Malayalam, English, etc.).`;

export default function Jarvis() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [bootText, setBootText] = useState("");
  const [time, setTime] = useState(new Date());
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const bootLines = [
    "JARVIS OS v4.2.1 — INITIALIZING...",
    "Neural Core: ONLINE",
    "Voice Module: ACTIVE",
    "Knowledge Base: LOADED",
    "Security Protocols: ENGAGED",
    "All systems nominal. Good day.",
  ];

  useEffect(() => {
    let i = 0;
    let text = "";
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        text += (i > 0 ? "\n" : "") + bootLines[i];
        setBootText(text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 600);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (bootDone) inputRef.current?.focus();
  }, [bootDone]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "I'm unable to respond at the moment, sir.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "A connection anomaly detected. Please stand by, sir." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmt = (d) => d.toLocaleTimeString("en-US", { hour12: false });
  const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030a0f",
      fontFamily: "'Courier New', monospace",
      color: "#00d4ff",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated grid background */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        * { box-sizing: border-box; }

        .jarvis-root { font-family: 'Share Tech Mono', monospace; }

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.6; }
          94% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateRingReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 8px #00d4ff44; }
          50% { box-shadow: 0 0 20px #00d4ffaa, 0 0 40px #00d4ff44; }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .scanline {
          position: fixed;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(transparent, rgba(0,212,255,0.08), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        .flicker { animation: flicker 8s infinite; }

        .chat-msg {
          animation: fadeInUp 0.3s ease forwards;
        }
        .user-bubble {
          background: linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.06));
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 2px 12px 12px 12px;
          padding: 10px 14px;
          max-width: 80%;
          align-self: flex-end;
          color: #e0f7ff;
          font-size: 13px;
          line-height: 1.6;
        }
        .jarvis-bubble {
          background: linear-gradient(135deg, rgba(0,60,80,0.6), rgba(0,30,50,0.8));
          border: 1px solid rgba(0,212,255,0.2);
          border-left: 3px solid #00d4ff;
          border-radius: 12px 12px 12px 2px;
          padding: 10px 14px;
          max-width: 85%;
          align-self: flex-start;
          color: #a8efff;
          font-size: 13px;
          line-height: 1.7;
        }
        .input-field {
          background: transparent;
          border: none;
          outline: none;
          color: #00d4ff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          flex: 1;
          caret-color: #00d4ff;
        }
        .input-field::placeholder { color: rgba(0,212,255,0.3); }
        .send-btn {
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.4);
          color: #00d4ff;
          padding: 8px 20px;
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .send-btn:hover {
          background: rgba(0,212,255,0.25);
          box-shadow: 0 0 15px rgba(0,212,255,0.3);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .dot-loader span {
          display: inline-block;
          width: 6px; height: 6px;
          background: #00d4ff;
          border-radius: 50%;
          margin: 0 3px;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
        .dot-loader span:nth-child(3) { animation-delay: 0.4s; }

        .ring-outer {
          animation: rotateRing 8s linear infinite;
        }
        .ring-inner {
          animation: rotateRingReverse 5s linear infinite;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 2px; }
      `}</style>

      <div className="grid-bg" />
      <div className="scanline" />

      {!bootDone ? (
        /* Boot Screen */
        <div className="flicker" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px",
        }}>
          {/* Arc reactor logo */}
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
            <svg className="ring-outer" width="120" height="120" style={{ position: "absolute", inset: 0 }}>
              <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1" strokeDasharray="8 4"/>
            </svg>
            <svg className="ring-inner" width="120" height="120" style={{ position: "absolute", inset: 0 }}>
              <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(0,212,255,0.6)" strokeWidth="1.5" strokeDasharray="4 8"/>
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "radial-gradient(circle, #00d4ff 0%, #0066aa 60%, #001a33 100%)",
                boxShadow: "0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.4)",
                animation: "pulse-ring 2s ease-in-out infinite",
              }}/>
            </div>
          </div>

          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 28, fontWeight: 900,
            letterSpacing: 8,
            color: "#00d4ff",
            textShadow: "0 0 20px #00d4ff",
            marginBottom: 8,
          }}>JARVIS</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(0,212,255,0.5)", marginBottom: 40 }}>
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </div>

          <div style={{
            background: "rgba(0,20,30,0.8)",
            border: "1px solid rgba(0,212,255,0.2)",
            padding: "20px 30px",
            width: "100%", maxWidth: 500,
            fontSize: 12, lineHeight: 2,
            color: "rgba(0,212,255,0.8)",
            whiteSpace: "pre-wrap",
          }}>
            {bootText}
            <span style={{ animation: "blink 1s step-end infinite" }}>█</span>
          </div>
        </div>
      ) : (
        /* Main Interface */
        <div className="flicker" style={{ flex: 1, display: "flex", flexDirection: "column", maxHeight: "100vh" }}>

          {/* Header */}
          <div style={{
            borderBottom: "1px solid rgba(0,212,255,0.15)",
            padding: "12px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(0,10,20,0.8)",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 36, height: 36 }}>
                <svg className="ring-outer" width="36" height="36" style={{ position: "absolute", inset: 0 }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1" strokeDasharray="4 3"/>
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "radial-gradient(circle, #00d4ff, #003366)",
                    boxShadow: "0 0 8px #00d4ff",
                  }}/>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 3, color: "#00d4ff" }}>
                  JARVIS
                </div>
                <div style={{ fontSize: 9, color: "rgba(0,212,255,0.4)", letterSpacing: 2 }}>AI ASSISTANT • ONLINE</div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: "#00d4ff", letterSpacing: 2 }}>
                {fmt(time)}
              </div>
              <div style={{ fontSize: 9, color: "rgba(0,212,255,0.4)", letterSpacing: 1 }}>{fmtDate(time)}</div>
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", gap: 16, padding: "6px 20px",
            borderBottom: "1px solid rgba(0,212,255,0.08)",
            fontSize: 9, letterSpacing: 2, color: "rgba(0,212,255,0.4)",
          }}>
            {["NEURAL: ACTIVE", "MEMORY: 96%", "RESPONSE: OPTIMAL", "SEC: LEVEL 5"].map(s => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4ff", display: "inline-block", boxShadow: "0 0 4px #00d4ff" }}/>
                {s}
              </span>
            ))}
          </div>

          {/* Chat area */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "20px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, opacity: 0.5, padding: "40px 0",
              }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(0,212,255,0.5)" }}>
                  AWAITING YOUR COMMAND
                </div>
                <div style={{ fontSize: 10, color: "rgba(0,212,255,0.3)", textAlign: "center", maxWidth: 300, lineHeight: 2 }}>
                  Good day. I am JARVIS, at your service.<br/>
                  How may I assist you today?
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="chat-msg" style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  fontSize: 9, letterSpacing: 2, marginBottom: 4,
                  color: "rgba(0,212,255,0.35)",
                }}>
                  {m.role === "user" ? "YOU" : "JARVIS"}
                </div>
                <div className={m.role === "user" ? "user-bubble" : "jarvis-bubble"}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 4, color: "rgba(0,212,255,0.35)" }}>JARVIS</div>
                <div className="jarvis-bubble">
                  <span className="dot-loader">
                    <span/><span/><span/>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            borderTop: "1px solid rgba(0,212,255,0.15)",
            padding: "14px 20px",
            background: "rgba(0,10,20,0.9)",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.2)",
              padding: "10px 16px",
              animation: "glowPulse 3s ease-in-out infinite",
            }}>
              <span style={{ color: "rgba(0,212,255,0.4)", fontSize: 12 }}>▶</span>
              <input
                ref={inputRef}
                className="input-field"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter command..."
                disabled={loading}
              />
              <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                SEND
              </button>
            </div>
            <div style={{ fontSize: 9, color: "rgba(0,212,255,0.2)", letterSpacing: 1, marginTop: 6, paddingLeft: 2 }}>
              PRESS ENTER TO TRANSMIT • SHIFT+ENTER FOR NEW LINE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
