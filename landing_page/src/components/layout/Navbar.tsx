import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#4586FF] rounded-xl flex items-center justify-center text-white">
          {/* Using a placeholder icon for the logo */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
          </svg>
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
    </nav>
  );
}
