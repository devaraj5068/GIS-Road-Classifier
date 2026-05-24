import React from "react";
import { Cpu, Layers, Radio } from "lucide-react";

interface DashboardHeaderProps {
  apiKeyActive: boolean;
  systemStatus: "idle" | "scanning" | "error" | "validated";
}

export function DashboardHeader({ apiKeyActive, systemStatus }: DashboardHeaderProps) {
  return (
    <header className="border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4" id="dashboard-nav-header">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-orange-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-2.5 bg-slate-900 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                GIS CORE v3.5
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <h1 className="text-lg font-bold font-display tracking-tight text-white mt-0.5">
              SATELLITE INTEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">ANALYSIS STATION</span>
            </h1>
          </div>
        </div>

        {/* Telemetry States */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Telemetry:</span>
            <span className="text-cyan-400 font-bold uppercase">CONNECTED</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === "scanning" 
                ? "bg-amber-500 animate-ping" 
                : systemStatus === "error" 
                ? "bg-rose-500" 
                : "bg-emerald-500"
            }`}></span>
            <span>Sensor Mode:</span>
            <span className={`font-bold ${
              systemStatus === "scanning" 
                ? "text-amber-400" 
                : systemStatus === "error" 
                ? "text-rose-400" 
                : "text-emerald-400"
            } uppercase`}>
              {systemStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
