"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function Hero() {
  // Animation configuration for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 80, damping: 20 } 
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
      
      {/* Left Column: Copy */}
      <motion.div 
        className="max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Rating Badge */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[#0D0D0D] font-medium text-[15px]">5.0 (980 Reviews)</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="text-[56px] font-medium leading-[64.4px] tracking-[-1.68px] text-[#0D0D0D] mb-6">
          Instant Answers from Trusted Clinical Guidelines
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="text-gray-600 text-[18px] leading-relaxed mb-10 max-w-lg">
          Providing advanced healthcare AI solutions with a compassionate touch for every medical professional.
        </motion.p>

        {/* CTA Group */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-12">
          <button className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[16px] px-8 py-4 rounded-[80px] transition-colors">
            Get Started
          </button>
          <button className="flex items-center gap-3 text-[#0D0D0D] font-medium px-4 py-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
              <Play size={18} fill="currentColor" className="ml-1" />
            </div>
            Watch Video
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex -space-x-4">
            <img src="https://i.pravatar.cc/100?img=32" alt="User 1" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
            <img src="https://i.pravatar.cc/100?img=44" alt="User 2" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
            <img src="https://i.pravatar.cc/100?img=68" alt="User 3" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
          </div>
          <div>
            <div className="font-medium text-[#0D0D0D]">5000+ Appointments</div>
            <div className="text-sm text-gray-500">Patients booked already</div>
          </div>
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
          alt="Medical Professional using Tablet"
          className="w-full h-full object-cover"
        />
        
        {/* Floating Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-6 right-6"
        >
          <button className="bg-[#4586FF] text-white font-medium text-sm px-6 py-3 rounded-[80px] shadow-lg hover:bg-blue-600 transition-colors">
            See Documentation
          </button>
        </motion.div>
      </motion.div>

    </section>
  );
}
