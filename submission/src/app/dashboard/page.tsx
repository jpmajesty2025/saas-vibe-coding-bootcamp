import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Activity, MessageSquare, BookOpen, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const RECENT_QUERIES = [
  {
    question: "What are the symptoms of measles and when should I suspect it?",
    timestamp: "Today, 2:14 PM",
    sources: 3,
  },
  {
    question: "What is the recommended MMR vaccination schedule for children?",
    timestamp: "Today, 1:52 PM",
    sources: 2,
  },
  {
    question: "How should I manage a measles exposure in a healthcare setting?",
    timestamp: "Yesterday, 4:30 PM",
    sources: 4,
  },
];

const COVERAGE_AREAS = [
  { label: "Measles / Mumps / Rubella", chunks: 525, color: "teal" },
  { label: "Pertussis (Whooping Cough)", chunks: 154, color: "blue" },
  { label: "Influenza", chunks: 439, color: "indigo" },
  { label: "COVID-19", chunks: 23, color: "purple" },
  { label: "Immunization Schedules", chunks: 14, color: "slate" },
];

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const firstName = user.firstName ?? user.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "there";
  const queriesUsed = 3;
  const queryLimit = 10;
  const usagePct = Math.round((queriesUsed / queryLimit) * 100);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D0D0D]">Welcome back, {firstName}</h1>
          <p className="text-slate-500 text-sm mt-1">Your clinical AI decision support dashboard</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-sm px-5 py-2.5 rounded-[80px] transition-colors"
        >
          <MessageSquare size={14} />
          Ask a Question
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Queries This Month", value: `${queriesUsed} / ${queryLimit}`, icon: MessageSquare, sub: "Free plan" },
          { label: "CDC Sources", value: "27", icon: BookOpen, sub: "Indexed guidelines" },
          { label: "Knowledge Chunks", value: "1,155+", icon: Activity, sub: "Searchable content" },
          { label: "Current Plan", value: "Free", icon: Zap, sub: "Upgrade for unlimited" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-teal-600" />
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <div className="text-xl font-semibold text-[#0D0D0D]">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Usage meter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0D0D0D]">Monthly Usage</h2>
            <span className="text-xs text-slate-400">Resets Mar 1</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-[#0D0D0D]">{queriesUsed}</span>
            <span className="text-slate-400 text-sm mb-1">/ {queryLimit} queries</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
            <Zap size={14} className="text-[#4586FF] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#0D0D0D]">Upgrade to Pro</p>
              <p className="text-xs text-slate-500 mt-0.5">Get unlimited queries + all 4 disease areas for $49/mo</p>
            </div>
            <Link href="/#pricing" className="ml-auto shrink-0">
              <ArrowRight size={14} className="text-[#4586FF]" />
            </Link>
          </div>
        </div>

        {/* Coverage areas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={15} className="text-teal-600" />
            <h2 className="font-semibold text-[#0D0D0D]">Knowledge Base Coverage</h2>
          </div>
          <ul className="space-y-2.5">
            {COVERAGE_AREAS.map((area) => (
              <li key={area.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{area.label}</span>
                <span className="text-xs text-slate-400 font-medium">{area.chunks} chunks</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            All sources from CDC clinical guidelines · Updated 2025–2026
          </p>
        </div>
      </div>

      {/* Recent queries */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0D0D0D]">Recent Queries</h2>
          <Link href="/chat" className="text-xs text-[#4586FF] hover:underline font-medium">
            New query →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {RECENT_QUERIES.map((q, i) => (
            <li key={i} className="py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 truncate">{q.question}</p>
                <p className="text-xs text-slate-400 mt-0.5">{q.timestamp} · {q.sources} sources cited</p>
              </div>
              <Link
                href="/chat"
                className="shrink-0 text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
              >
                Ask again
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
