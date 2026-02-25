"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Activity, ArrowLeft, Stethoscope, ExternalLink, ChevronDown, ChevronUp, FlaskConical, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";

const EXAMPLE_QUERIES = [
  "What are the symptoms of measles and when should I suspect it?",
  "What is the recommended MMR vaccination schedule for children?",
  "How should I manage a measles exposure in a healthcare setting?",
  "What are the clinical features that distinguish pertussis from other respiratory illnesses?",
  "What are the influenza antiviral treatment recommendations for high-risk patients?",
];

interface SourceResult {
  title: string;
  url: string;
  snippet: string;
  similarity: number;
}

interface ActiveCitation {
  messageId: string;
  title: string;
}

interface CitationBadgeProps {
  label: string;
  messageId: string;
  sources: SourceResult[];
  activeCitation: ActiveCitation | null;
  onToggle: (messageId: string, title: string) => void;
}

function CitationBadge({ label, messageId, sources, activeCitation, onToggle }: CitationBadgeProps) {
  const source = sources.find((s) => s.title === label);
  const isActive = activeCitation?.messageId === messageId && activeCitation?.title === label;
  const hasSource = Boolean(source);

  return (
    <button
      onClick={() => hasSource && onToggle(messageId, label)}
      disabled={!hasSource}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mx-0.5 whitespace-nowrap transition-colors ${
        hasSource
          ? isActive
            ? "bg-teal-600 text-white border-teal-600 cursor-pointer"
            : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 cursor-pointer"
          : "bg-teal-50 text-teal-700 border-teal-200 cursor-default"
      }`}
    >
      <Stethoscope size={10} />
      {label}
      {hasSource && (isActive ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
    </button>
  );
}

function SourceCard({ source }: { source: SourceResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="mt-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-slate-700 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-semibold text-teal-800 leading-snug">{source.title}</span>
        <span className="shrink-0 text-teal-600 font-medium">{source.similarity}% match</span>
      </div>
      <p className="leading-relaxed text-slate-600 mb-2">{source.snippet}…</p>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium transition-colors"
      >
        View on CDC <ExternalLink size={10} />
      </a>
    </motion.div>
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

const NO_CONTEXT_PHRASES = [
  "I cannot answer this based on the provided clinical guidelines",
  "No relevant clinical guidelines were found",
];

function isNoContextResponse(text: string): boolean {
  return NO_CONTEXT_PHRASES.some((phrase) => text.includes(phrase));
}

function NoContextCard({ onSuggest }: { onSuggest: (q: string) => void }) {
  const suggestions = [
    "What are the symptoms of measles?",
    "What is the MMR vaccination schedule?",
    "How is pertussis diagnosed and treated?",
  ];
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
      <div className="flex items-center gap-2 mb-2 text-amber-700 font-medium">
        <AlertCircle size={15} />
        No matching CDC guidelines found
      </div>
      <p className="text-slate-600 text-xs mb-3">
        This query didn&apos;t match any indexed CDC guidelines. Try rephrasing or ask about MMR, Pertussis, Influenza, or COVID-19.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-xs px-2.5 py-1 rounded-lg border border-teal-200 bg-white text-teal-700 hover:bg-teal-50 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DemoInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/demo-chat" }),
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showExamples, setShowExamples] = useState(true);

  const [sourcesMap, setSourcesMap] = useState<Map<string, SourceResult[]>>(new Map());
  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(null);
  const lastUserQueryRef = useRef<string>("");
  const prevStatusRef = useRef<string>(status);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0) setShowExamples(false);
  }, [messages.length]);

  const fetchSources = useCallback(async (query: string, messageId: string) => {
    try {
      const res = await fetch("/api/demo-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.sources?.length) {
        setSourcesMap((prev) => new Map(prev).set(messageId, data.sources));
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prevStatus === "streaming" && status === "ready") {
      const assistantMessages = messages.filter((m) => m.role === "assistant");
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      if (lastAssistant && lastUserQueryRef.current) {
        fetchSources(lastUserQueryRef.current, lastAssistant.id);
      }
    }
  }, [status, messages, fetchSources]);

  function handleToggleCitation(messageId: string, title: string) {
    setActiveCitation((prev) =>
      prev?.messageId === messageId && prev?.title === title ? null : { messageId, title }
    );
  }

  function submitQuery(query: string) {
    if (!query.trim() || isLoading) return;
    lastUserQueryRef.current = query.trim();
    setActiveCitation(null);
    sendMessage({ text: query.trim() });
    setInput("");
  }

  function handleExampleClick(query: string) {
    submitQuery(query);
  }

  function submit() {
    submitQuery(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-amber-800">
          <FlaskConical size={13} className="shrink-0" />
          <span><strong>Demo mode</strong> — No sign-in required. Responses are grounded in CDC clinical guidelines.</span>
        </div>
        <Link
          href="/sign-up"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <UserPlus size={11} />
          Sign up free
        </Link>
      </div>

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
          CDC Clinical Guidelines — MMR, Pertussis, Influenza, COVID-19
        </div>
        <span className="ml-auto text-xs text-slate-400 hidden sm:block">
          Powered by VitalDocs AI · For healthcare professionals
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
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

        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => {
            const textContent = message.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { type: "text"; text: string }).text)
              .join("");
            const msgSources = sourcesMap.get(message.id) ?? [];
            const parsedParts = message.role === "assistant" ? parseMessageContent(textContent) : null;

            const activeCitationTitle =
              activeCitation?.messageId === message.id ? activeCitation.title : null;
            const activeSource = activeCitationTitle
              ? msgSources.find((s) => s.title === activeCitationTitle) ?? null
              : null;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}>
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
                    {message.role === "assistant" && parsedParts
                      ? isNoContextResponse(textContent)
                        ? <NoContextCard onSuggest={submitQuery} />
                        : parsedParts.map((part, i) =>
                            part.type === "citation" ? (
                              <CitationBadge
                                key={i}
                                label={part.value}
                                messageId={message.id}
                                sources={msgSources}
                                activeCitation={activeCitation}
                                onToggle={handleToggleCitation}
                              />
                            ) : (
                              <span key={i}>{part.value}</span>
                            )
                          )
                      : textContent}
                  </div>
                </div>

                <AnimatePresence>
                  {activeSource && (
                    <div className={`w-full max-w-[85%] mt-1 ${message.role === "assistant" ? "ml-9" : ""}`}>
                      <SourceCard source={activeSource} />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

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
              placeholder="Ask a clinical question about MMR, Pertussis, Influenza, COVID-19..."
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
