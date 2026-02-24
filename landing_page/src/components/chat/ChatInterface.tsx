"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Activity, ArrowLeft, Stethoscope } from "lucide-react";
import Link from "next/link";

const EXAMPLE_QUERIES = [
  "What are the symptoms of measles and when should I suspect it?",
  "What is the recommended MMR vaccination schedule for children?",
  "How should I manage a measles exposure in a healthcare setting?",
  "What are the contraindications for the MMR vaccine?",
  "What are the clinical features that distinguish pertussis from other respiratory illnesses?",
];

interface CitationBadgeProps {
  label: string;
}

function CitationBadge({ label }: CitationBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 mx-0.5 whitespace-nowrap">
      <Stethoscope size={10} />
      {label}
    </span>
  );
}

function parseMessageContent(content: string) {
  const parts: Array<{ type: "text" | "citation"; value: string }> = [];
  const regex = /\[Source \d+: ([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "citation", value: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }
  return parts;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-teal-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showExamples, setShowExamples] = useState(true);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0) setShowExamples(false);
  }, [messages.length]);

  function handleExampleClick(query: string) {
    setInput(query);
    inputRef.current?.focus();
  }

  function submit() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center gap-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Activity size={15} className="text-teal-600" />
          CDC Clinical Guidelines — MMR, Pertussis, COVID-19
        </div>
        <span className="ml-auto text-xs text-slate-400 hidden sm:block">
          Powered by VitalDocs AI · For healthcare professionals
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Empty state */}
        <AnimatePresence>
          {showExamples && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Stethoscope size={26} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Ask a clinical question
              </h2>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                Answers are grounded exclusively in CDC clinical guidelines. Not a substitute for professional judgment.
              </p>
              <div className="grid gap-2 text-left">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleExampleClick(q)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-teal-400 hover:bg-teal-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list */}
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => {
            const textContent = message.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { type: "text"; text: string }).text)
              .join("");

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0 mr-2 mt-0.5">
                    <Activity size={13} strokeWidth={2.5} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-[#4586FF] text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {message.role === "assistant"
                    ? parseMessageContent(textContent).map((part, i) =>
                        part.type === "citation" ? (
                          <CitationBadge key={i} label={part.value} />
                        ) : (
                          <span key={i}>{part.value}</span>
                        )
                      )
                    : textContent}
                </div>
              </motion.div>
            );
          })}

          {/* Thinking indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0 mr-2 mt-0.5">
                <Activity size={13} strokeWidth={2.5} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm">
                <ThinkingDots />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a clinical question about MMR, Pertussis, COVID-19..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 disabled:opacity-60 transition-colors max-h-40 overflow-y-auto"
              style={{ lineHeight: "1.5" }}
            />
          </div>
          <button
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className="h-[46px] w-[46px] rounded-xl bg-[#4586FF] hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2 max-w-2xl mx-auto">
          Answers sourced exclusively from CDC clinical guidelines. Not a substitute for professional judgment.
        </p>
      </div>
    </div>
  );
}
