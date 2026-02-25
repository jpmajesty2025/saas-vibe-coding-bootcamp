"use client";

import { motion } from "framer-motion";
import { Search, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Ask a Clinical Question",
    description:
      "Type any question about MMR, pertussis, influenza, or COVID-19 management. No special syntax required — plain clinical language works.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: Zap,
    number: "02",
    title: "AI Retrieves Relevant CDC Guidance",
    description:
      "VitalDocs AI embeds your query and searches 1,155+ indexed chunks from 27 CDC source documents using cosine similarity, returning only high-confidence matches.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Get a Cited, Streamed Answer",
    description:
      "The answer streams in real-time, grounded exclusively in the retrieved CDC context. Every claim is tagged with an inline citation badge you can expand to see the source snippet.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 20 } },
};

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-teal-600 font-semibold text-sm tracking-wide uppercase mb-3">
          How It Works
        </span>
        <h2 className="text-4xl font-medium tracking-tight text-[#0D0D0D] mb-4">
          From question to cited answer in seconds
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          A three-step pipeline that retrieves, grounds, and cites every response in live CDC clinical guidelines.
        </p>
      </motion.div>

      {/* Steps */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8 mb-14"
      >
        {STEPS.map(({ icon: Icon, number, title, description, color }) => (
          <motion.div key={number} variants={itemVariants}>
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-full hover:shadow-md transition-shadow">
              <span className="absolute top-6 right-6 text-5xl font-bold text-gray-100 select-none leading-none">
                {number}
              </span>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-5 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-[#0D0D0D] mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          href="/demo"
          className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-8 py-4 rounded-[80px] transition-colors"
        >
          Try the Demo — No Sign-in Required
        </Link>
        <a
          href="https://www.loom.com/share/2ae15318132743afbb00c4014f557b5d"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0D0D0D] font-medium text-[15px] hover:opacity-70 transition-opacity"
        >
          Watch the 60-second walkthrough →
        </a>
      </motion.div>
    </section>
  );
}
