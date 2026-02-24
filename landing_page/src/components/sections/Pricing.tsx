"use client";

import { motion } from "framer-motion";
import { Check, Zap, Building2, Stethoscope } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    icon: Stethoscope,
    price: "$0",
    period: "forever",
    description: "Try VitalDocs AI with no commitment.",
    cta: "Start for Free",
    ctaHref: "/chat",
    highlight: false,
    features: [
      "10 clinical queries / month",
      "Access to CDC MMR & Pertussis guidelines",
      "Inline citation badges",
      "Email support",
    ],
    missing: [
      "Influenza & COVID-19 guidelines",
      "Unlimited queries",
      "Team seats",
      "EHR integration",
    ],
  },
  {
    name: "Pro",
    icon: Zap,
    price: "$49",
    period: "per month",
    description: "Full clinical coverage for individual practitioners.",
    cta: "Start Free Trial",
    ctaHref: "/chat",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited clinical queries",
      "All 27 CDC source documents",
      "MMR, Pertussis, Influenza & COVID-19",
      "Interactive source card citations",
      "Priority email support",
      "Early access to new guidelines",
    ],
    missing: [
      "Team seats",
      "EHR integration",
    ],
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "contact us",
    description: "For hospitals, clinics, and health systems.",
    cta: "Contact Sales",
    ctaHref: "mailto:sales@vitaldocs.ai",
    highlight: false,
    features: [
      "Everything in Pro",
      "Unlimited team seats",
      "Custom CDC guideline sources",
      "EHR / EMR integration",
      "SSO & SAML authentication",
      "SLA + dedicated support",
      "HIPAA BAA available",
    ],
    missing: [],
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 70, damping: 20 } },
};

export default function Pricing() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          Simple, transparent pricing
        </span>
        <h2 className="text-[40px] font-medium tracking-tight text-[#0D0D0D] mb-4">
          Plans for every practice
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Start free, upgrade when you need it. All plans include CDC-grounded answers with full source citations.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-[28px] p-8 border ${
                plan.highlight
                  ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-2xl scale-[1.03]"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4586FF] text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </span>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlight ? "bg-white/10" : "bg-slate-100"}`}>
                  <Icon size={18} className={plan.highlight ? "text-white" : "text-slate-700"} />
                </div>
                <span className={`font-semibold text-lg ${plan.highlight ? "text-white" : "text-[#0D0D0D]"}`}>{plan.name}</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-[#0D0D0D]"}`}>
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className={`text-sm ml-2 ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>/{plan.period}</span>
                )}
              </div>
              <p className={`text-sm mb-8 ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>{plan.description}</p>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`w-full text-center font-medium text-[15px] px-6 py-3 rounded-[80px] transition-colors mb-8 block ${
                  plan.highlight
                    ? "bg-[#4586FF] hover:bg-blue-500 text-white"
                    : "bg-[#0D0D0D] hover:bg-gray-800 text-white"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={`mt-0.5 shrink-0 ${plan.highlight ? "text-teal-400" : "text-teal-600"}`} />
                    <span className={plan.highlight ? "text-white/80" : "text-slate-700"}>{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-35">
                    <span className="mt-0.5 w-[15px] shrink-0 text-center">—</span>
                    <span className={plan.highlight ? "text-white/60" : "text-slate-500"}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-gray-400 mt-10"
      >
        All plans include a 14-day free trial. No credit card required for Free or Pro. Cancel anytime.
      </motion.p>
    </section>
  );
}
