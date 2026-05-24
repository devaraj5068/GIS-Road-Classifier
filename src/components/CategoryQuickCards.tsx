import React from "react";
import { Milestone, Navigation, Landmark, TreePine, Construction, ArrowRight } from "lucide-react";

interface CategoryQuickCardsProps {
  onSelectCategory: (id: "highway" | "street" | "village" | "dirt" | "concrete") => void;
  activeId: string;
  isPresetActive: boolean;
}

const CATEGORY_STYLE_MAP = {
  highway: {
    label: "Highway",
    desc: "Multi-lane, asphalt, clear marks, fast layout",
    glow: "hover:shadow-cyan-500/20 hover:border-cyan-500/40 border-cyan-500/10",
    textGlow: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    icon: Milestone
  },
  street: {
    label: "Street Road",
    desc: "Urban paved road, residential houses, or shops",
    glow: "hover:shadow-indigo-500/20 hover:border-indigo-500/40 border-indigo-500/10",
    textGlow: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Landmark
  },
  village: {
    label: "Village Road",
    desc: "Narrow paved rural track, high canopy forests",
    glow: "hover:shadow-emerald-500/20 hover:border-emerald-500/40 border-emerald-500/10",
    textGlow: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: TreePine
  },
  dirt: {
    label: "Dirt Road",
    desc: "Unpaved clay, orange soil, rugged wheels tracks",
    glow: "hover:shadow-amber-500/20 hover:border-amber-500/40 border-amber-500/10",
    textGlow: "text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Navigation
  },
  concrete: {
    label: "Concrete Road",
    desc: "Light gray surface, expansion joints, stone slabs",
    glow: "hover:shadow-purple-500/20 hover:border-purple-500/40 border-purple-500/10",
    textGlow: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: Construction
  }
};

export function CategoryQuickCards({ onSelectCategory, activeId, isPresetActive }: CategoryQuickCardsProps) {
  return (
    <div className="space-y-4" id="road-type-visual-cards-section">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase">
          Terrain Category Explorer
        </h3>
        <span className="text-[10px] font-mono text-cyan-400">
          Click any card to load simulated vector GIS feed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {(Object.keys(CATEGORY_STYLE_MAP) as Array<keyof typeof CATEGORY_STYLE_MAP>).map((key, i) => {
          const config = CATEGORY_STYLE_MAP[key];
          const isActive = isPresetActive && activeId === key;
          const IconComponent = config.icon;

          return (
            <div
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`p-5 rounded-2xl glass-panel transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                config.glow
              } ${
                isActive 
                  ? "ring-2 ring-cyan-400 bg-slate-900 shadow-xl" 
                  : "hover:bg-slate-950/80"
              }`}
            >
              {/* Highlight gradient indicator overlay for hovered elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full group-hover:from-white/10 transition-colors"></div>

              {/* Icon Container */}
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${config.badgeBg}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600 block group-hover:text-slate-400 transition-colors">
                  0{i + 1}
                </span>
              </div>

              {/* Copywriting */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                  {config.label}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {config.desc}
                </p>
              </div>

              {/* Status bar/action */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className={isActive ? "text-cyan-400 font-bold" : "text-slate-500"}>
                  {isActive ? "● LOADED" : "SELECT FEED"}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Bottom linear neon edge bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all ${
                isActive ? "bg-gradient-to-r from-cyan-400 to-orange-400" : "bg-transparent group-hover:bg-slate-700"
              }`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
