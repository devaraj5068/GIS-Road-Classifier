import React from "react";
import { Cpu, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 mt-16" id="dashboard-footer-layout">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        
        {/* Right Ownership */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-mono text-slate-400 font-semibold uppercase tracking-wider">
            AI-Powered GIS Road Type Classification System
          </p>
          <p className="text-slate-500">
            Automated Satellite & Aerial Terrain Sensing Workbench. All rights reserved © 2026.
          </p>
        </div>

        {/* Dynamic Technologies list */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/20 text-cyan-400">
            TensorFlow 2.15
          </span>
          <span className="px-2 py-0.5 rounded bg-orange-950/40 border border-orange-850/20 text-orange-400">
            OpenCV 4.8
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-850/20 text-indigo-400">
            Gemini Flash
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-350">
            React 19 + Tailwind CSS
          </span>
        </div>

        {/* Developer info */}
        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-400">Developed for Earth Observation Intelligence</span>
          <span>•</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-900 rounded border border-slate-800"
            title="Sensing Hub Reference Code"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

      </div>
    </footer>
  );
}
