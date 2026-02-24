"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { label: "Chat", href: "/chat" },
  { label: "Pricing", href: "/#pricing" },
  { label: "CDC Guidelines", href: "https://www.cdc.gov", external: true },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#4586FF] rounded-xl flex items-center justify-center text-white">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <span className="font-medium text-xl tracking-tight">VitalDocs AI</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-[#0D0D0D] font-medium text-[15px]">
        {NAV_LINKS.map(({ label, href, external }) =>
          external ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              {label}
            </a>
          ) : (
            <Link key={label} href={href} className="hover:text-gray-600 transition-colors">
              {label}
            </Link>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-[#0D0D0D] font-medium text-[15px] px-4 py-2 hover:text-gray-600 transition-colors">
              Sign in
            </button>
          </SignInButton>
          <Link
            href="/chat"
            className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-[22px] py-[10px] rounded-[80px] transition-colors"
          >
            Start Free Trial
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/chat"
            className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-[22px] py-[10px] rounded-[80px] transition-colors"
          >
            Open Chat
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  );
}
