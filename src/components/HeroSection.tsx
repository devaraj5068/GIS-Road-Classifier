import React from "react";
import { Sparkles, Upload, Zap, Globe, Compass } from "lucide-react";

interface HeroSectionProps {
  onTriggerUpload: () => void;
  onTriggerPrediction: () => void;
  isReady: boolean;
}

export function HeroSection({ onTriggerUpload, onTriggerPrediction, isReady }: HeroSectionProps) {
  return (
    <section 
      className="relative overflow-hidden rounded-2xl border border-cyan-500/10 bg-slate-900/40 p-6 md:p-10 shadow-2xl space-y-6" 
      id="gis-dashboard-hero"
    >
      {/* Decorative ambient background overlays */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Core Description Copy */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 w-fit">
            <span className="p-1 rounded bg-orange-500/10 text-orange-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </span>
            <span className="text-xs uppercase tracking-widest text-orange-400 font-mono font-bold">
              Autonomous Sensing System
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-orange-400">GIS Road Type</span> Classification
          </h1>
          
          <h2 className="text-sm md:text-base text-cyan-300/90 font-mono font-medium tracking-wide">
            Deep Learning based Satellite Road Analysis System
          </h2>
          
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Analyze terrestrial paths directly from satellite ingress files. Our dual convolutional scoring neural network models extract gravel frequencies, lane segmentations, and environmental cues to instantly index Highway, Street, Village, Dirt, or Concrete structures. Equipped with instant domestic screening filters to reject out-of-domain uploads.
          </p>

          {/* Core Interactive Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-3">
            <button
              onClick={onTriggerUpload}
              className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 rounded-xl font-bold font-display text-sm transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2 cursor-pointer duration-200"
            >
              <Upload className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              <span>Upload GIS Image</span>
            </button>

            <button
              onClick={onTriggerPrediction}
              disabled={!isReady}
              className={`group relative px-6 py-3 rounded-xl text-sm font-bold font-display transition-all border flex items-center gap-2 cursor-pointer duration-200 ${
                isReady
                  ? "bg-slate-950 text-orange-400 border-orange-500/40 hover:bg-slate-900 shadow-lg hover:shadow-orange-500/10"
                  : "bg-slate-950/40 text-slate-500 border-slate-800 cursor-not-allowed"
              }`}
            >
              <Zap className={`w-4.5 h-4.5 text-orange-400 ${isReady ? "animate-pulse" : ""}`} />
              <span>Start Live Prediction</span>
            </button>
          </div>
        </div>

        {/* Floating Isometric Globe UI */}
        <div className="lg:col-span-4 hidden lg:block relative text-center">
          <div className="w-48 h-48 rounded-full border border-cyan-500/20 bg-slate-950/60 flex items-center justify-center mx-auto relative overflow-hidden ring-4 ring-cyan-500/5 glow-pulsing">
            {/* Spinning background lines */}
            <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/10 animate-spin-slow"></div>
            <div className="absolute inset-10 rounded-full border border-cyan-500/5 animate-ping"></div>

            <Globe className="w-20 h-20 text-cyan-400/80" />
            
            {/* Overlay indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-400 whitespace-nowrap">
              STATION.ACTIVE
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-orange-400 animate-spin-slow" />
              89.1° LAT / 11.4° LON
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
