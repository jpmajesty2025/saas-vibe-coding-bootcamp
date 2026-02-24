"use client";

import { motion, type Variants } from "framer-motion";
import { ShieldCheck, BookOpen } from "lucide-react";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

const STATS = [
  { value: "1,155+", label: "Clinical guidelines indexed" },
  { value: "27", label: "CDC source documents" },
  { value: "4", label: "Disease areas covered" },
];

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">

      {/* Left Column: Copy */}
      <motion.div
        className="max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Trust Badge */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5">
            <ShieldCheck size={15} className="text-teal-600" />
            <span className="text-teal-700 font-medium text-[14px]">Grounded in CDC Clinical Guidelines · 2025–2026</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="text-[56px] font-medium leading-[64.4px] tracking-[-1.68px] text-[#0D0D0D] mb-6">
          Instant Answers from Trusted Clinical Guidelines
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="text-gray-600 text-[18px] leading-relaxed mb-10 max-w-lg">
          AI-powered clinical decision support grounded exclusively in CDC guidelines. Get accurate, cited answers on MMR, pertussis, influenza, and COVID-19 — in seconds.
        </motion.p>

        {/* CTA Group */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-12">
          <Link href="/chat" className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[16px] px-8 py-4 rounded-[80px] transition-colors">
            Ask a Clinical Question
          </Link>
          <Link
            href="https://www.cdc.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[#0D0D0D] font-medium px-4 py-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
              <BookOpen size={18} />
            </div>
            Browse CDC Sources
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="flex items-center gap-8">
          {STATS.map((stat) => (
            <div key={stat.value}>
              <div className="font-semibold text-[#0D0D0D] text-lg">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Column: Hero Image Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3, delay: 0.3 }}
        className="relative w-full aspect-[3/4] max-h-[625px] bg-gray-100 rounded-[38px] overflow-hidden shadow-2xl"
      >
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1024&auto=format&fit=crop"
          alt="Healthcare professional using clinical decision support tool"
          className="w-full h-full object-cover"
        />

        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-6 right-6"
        >
          <Link
            href="/chat"
            className="bg-[#4586FF] text-white font-medium text-sm px-6 py-3 rounded-[80px] shadow-lg hover:bg-blue-600 transition-colors inline-block"
          >
            Try VitalDocs AI →
          </Link>
        </motion.div>
      </motion.div>

    </section>
  );
}
