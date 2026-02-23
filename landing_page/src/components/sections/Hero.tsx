import Image from "next/image";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Left Column: Copy */}
      <div className="max-w-xl">
        {/* Rating Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[#0D0D0D] font-medium text-[15px]">5.0 (980 Reviews)</span>
        </div>

        {/* Headline */}
        <h1 className="text-[56px] font-medium leading-[64.4px] tracking-[-1.68px] text-[#0D0D0D] mb-6">
          Instant Answers from Trusted Clinical Guidelines
        </h1>

        {/* Subheadline */}
        <p className="text-gray-600 text-[18px] leading-relaxed mb-10 max-w-lg">
          Providing advanced healthcare AI solutions with a compassionate touch for every medical professional.
        </p>

        {/* CTA Group */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <button className="bg-[#4586FF] hover:bg-blue-600 text-white font-medium text-[16px] px-8 py-4 rounded-[80px] transition-colors">
            Get Started
          </button>
          <button className="flex items-center gap-3 text-[#0D0D0D] font-medium px-4 py-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            Watch Video
          </button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
             {/* Placeholders for avatar images */}
            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-200" />
            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-300" />
            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-400" />
          </div>
          <div>
            <div className="font-medium text-[#0D0D0D]">5000+ Appointments</div>
            <div className="text-sm text-gray-500">Patients booked already</div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Image Container */}
      <div className="relative w-full aspect-[3/4] max-h-[625px] bg-gray-100 rounded-[38px] overflow-hidden">
        {/* We will use a placeholder Next Image here until we grab the actual asset */}
        <img 
          src="https://framerusercontent.com/images/RiukRfppKWATQjdvnvRv1Rm48.jpg?scale-down-to=1024" 
          alt="Medical Professional"
          className="w-full h-full object-cover"
        />
        
        {/* Floating Badge (See All Templates from original, adapting to VitalDocs) */}
        <div className="absolute bottom-6 right-6">
          <button className="bg-[#4586FF] text-white font-medium text-sm px-6 py-3 rounded-[80px] shadow-lg">
            See Documentation
          </button>
        </div>
      </div>

    </section>
  );
}
