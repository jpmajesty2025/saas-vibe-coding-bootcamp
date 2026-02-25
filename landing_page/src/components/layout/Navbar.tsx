"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Demo", href: "/demo" },
  { label: "Chat", href: "/chat" },
  { label: "Pricing", href: "/#pricing" },
  { label: "CDC Guidelines", href: "https://www.cdc.gov", external: true },
];

function NavLink({ label, href, external, onClick }: { label: string; href: string; external?: boolean; onClick?: () => void }) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="hover:text-gray-600 transition-colors"
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className="hover:text-gray-600 transition-colors">
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-7xl mx-auto w-full"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="w-10 h-10 bg-[#4586FF] rounded-xl flex items-center justify-center text-white">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <span className="font-medium text-xl tracking-tight">VitalDocs AI</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-[#0D0D0D] font-medium text-[15px]">
          {NAV_LINKS.map(({ label, href, external }) => (
            <NavLink key={label} label={label} href={href} external={external} />
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
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
              href="/dashboard"
              className="text-[#0D0D0D] font-medium text-[15px] px-4 py-2 hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-[22px] py-[10px] rounded-[80px] transition-colors"
            >
              Open Chat
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#0D0D0D] hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="flex flex-col px-6 py-4 gap-4 text-[#0D0D0D] font-medium text-[15px]">
              {NAV_LINKS.map(({ label, href, external }) => (
                <NavLink key={label} label={label} href={href} external={external} onClick={closeMobile} />
              ))}

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      onClick={closeMobile}
                      className="w-full text-left text-[#0D0D0D] font-medium text-[15px] py-2 hover:text-gray-600 transition-colors"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <Link
                    href="/chat"
                    onClick={closeMobile}
                    className="w-full text-center bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-6 py-3 rounded-[80px] transition-colors"
                  >
                    Start Free Trial
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="text-[#0D0D0D] font-medium text-[15px] py-2 hover:text-gray-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chat"
                    onClick={closeMobile}
                    className="w-full text-center bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-6 py-3 rounded-[80px] transition-colors"
                  >
                    Open Chat
                  </Link>
                  <div className="py-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
