"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#4586FF] rounded-xl flex items-center justify-center text-white">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <span className="font-medium text-xl tracking-tight">VitalDocs AI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-[#0D0D0D] font-medium text-[15px]">
        <Link href="#" className="hover:text-gray-600 transition-colors">About</Link>
        <Link href="#" className="hover:text-gray-600 transition-colors">Services</Link>
        <Link href="#" className="hover:text-gray-600 transition-colors">Doctors</Link>
        <Link href="#" className="hover:text-gray-600 transition-colors">Blog</Link>
      </div>

      <button className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[15px] px-[22px] py-[10px] rounded-[80px] transition-colors">
        Book a call
      </button>
    </motion.nav>
  );
}
