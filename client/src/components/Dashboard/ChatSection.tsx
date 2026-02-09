import { useState } from "react";

interface ChatSectionProps {
  onClose: () => void;
  playerContext: {
    championName: string;
    role: string;
    stats: {
      avgCS: number;
      avgKDA: number;
      avgVision: number;
      avgDeaths: number;
    };
    matches: any[];
  };
}

interface Message {
  role: "coach" | "user";
  content: string;
}

export default function ChatSection({ onClose, playerContext }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      content: `I see your CS is low at ${playerContext.stats.avgCS.toFixed(1)}/min. Let me ask you this: Do you struggle more during lane phase or after laning ends?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("http://localhost:3001/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
          playerContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "coach", content: data.reply }]);
      } else {
        throw new Error("Failed to get coach response");
      }
    } catch (error) {
      // Fallback response for now
      setMessages(prev => [...prev, { 
        role: "coach", 
        content: "That's helpful info. Let me analyze your games more deeply. This feature is still in development, but I'm learning your playstyle!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-light">
              Talk to Your AI Coach
            </h3>
            <p className="text-sm text-muted">Ask questions about your gameplay</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-muted hover:text-light transition-colors text-2xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-96 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
              msg.role === "coach" 
                ? "bg-gradient-to-br from-primary to-secondary" 
                : "bg-dark border border-border"
            }`}>
              {msg.role === "coach" ? "🤖" : "👤"}
            </div>
            <div className={`p-3 rounded-xl max-w-[70%] ${
              msg.role === "coach"
                ? "bg-primary/10 border border-primary/20"
                : "bg-dark border border-border"
            }`}>
              <p className="text-light leading-relaxed text-sm md:text-base">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-gradient-to-br from-primary to-secondary">
              🤖
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-light text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask your coach anything..."
          disabled={loading}
          className="flex-1 bg-dark border border-border rounded-lg px-4 py-3 text-light placeholder-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold text-dark hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          Send
        </button>
      </div>
    </div>
  );
}