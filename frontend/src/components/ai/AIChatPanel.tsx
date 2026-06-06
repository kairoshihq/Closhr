"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Market Analyst. Ask me anything about crypto markets, portfolio strategies, or price analysis.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreaming(true);

    // Add placeholder for assistant response
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await api.streamSSE(
        "/ai/chat",
        {
          message: userMessage.content,
          system_prompt: "You are an expert crypto market analyst for Kairoshi Finance. Provide concise, data-driven insights about cryptocurrency markets, portfolio strategies, and price analysis.",
        },
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content += chunk;
            }
            return updated;
          });
        },
        () => {
          setStreaming(false);
        }
      );
    } catch (err) {
      // Fallback response if API fails
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant") {
          last.content =
            "I'm currently unable to connect to the AI service. Please ensure the backend is running at " +
            (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") +
            " and try again.";
        }
        return updated;
      });
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white flex items-center justify-center shadow-lg glow-accent hover:scale-105 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-[360px] h-[480px] bg-[#111320] border border-[#1e2130] rounded-xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1e2130] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-[#e2e8f0]">
                  AI Market Analyst
                </p>
                <p className="text-[9px] text-[#22c55e] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
                  Online
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[#151822] transition-colors"
              >
                <X size={14} className="text-[#4a5568]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user"
                        ? "bg-[#1a1d2e]"
                        : "bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User size={12} className="text-[#94a3b8]" />
                    ) : (
                      <Bot size={12} className="text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-[11px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#151822] text-[#e2e8f0] border border-[#1e2130]"
                    )}
                  >
                    {msg.content || (
                      <Loader2 size={14} className="animate-spin text-[#4a5568]" />
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#1e2130]">
              <div className="flex items-center gap-2 bg-[#0b0d11] border border-[#1e2130] rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about crypto markets..."
                  className="flex-1 bg-transparent text-[11px] text-[#e2e8f0] placeholder:text-[#3a4058] outline-none"
                  disabled={streaming}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || streaming}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    input.trim() && !streaming
                      ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                      : "text-[#3a4058]"
                  )}
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
