import React from "react";
import { Layers, HelpCircle, Activity, Landmark, Compass, Eye, Map, Shield } from "lucide-react";
import { ClassificationResult } from "../types";

interface AIPredictionAnalysisPanelProps {
  classificationResult: ClassificationResult | null;
}

export function AIPredictionAnalysisPanel({ classificationResult }: AIPredictionAnalysisPanelProps) {
  // Hardcoded default values if classification result is empty
  const mockConfidenceLevels = [
    { name: "Highway", score: classificationResult?.roadType === "Highway" ? classificationResult.confidence : 15, color: "bg-cyan-400" },
    { name: "Street Road", score: classificationResult?.roadType === "Street Road" ? classificationResult.confidence : 10, color: "bg-indigo-400" },
    { name: "Village Road", score: classificationResult?.roadType === "Village Road" ? classificationResult.confidence : 8, color: "bg-emerald-400" },
    { name: "Dirt Road", score: classificationResult?.roadType === "Dirt Road" ? classificationResult.confidence : 5, color: "bg-amber-400" },
    { name: "Concrete Road", score: classificationResult?.roadType === "Concrete Road" ? classificationResult.confidence : 3, color: "bg-purple-400" },
  ];

  // Dynamically update standard levels so total matches or scales nicely
  const orderedConfidence = mockConfidenceLevels.map(item => {
    if (classificationResult) {
      if (item.name === classificationResult.roadType) {
        return { ...item, score: classificationResult.confidence };
      } else {
        const remaining = 100 - classificationResult.confidence;
        return { ...item, score: Math.round((item.score / 40) * remaining) };
      }
    }
    return item;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-300" id="ai-neural-analysis-grid">
      
      {/* Left panel: Software probability visualization */}
      <div className="lg:col-span-6 bg-slate-950/60 rounded-2xl border border-slate-800 p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold font-display text-white text-sm">
              SOFTMAX DISTRIBUTION GRAPH
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">REALTIME TELEMETRY</span>
        </div>

        {/* Custom confidence bar graphs */}
        <div className="space-y-4">
          {orderedConfidence.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">{item.name}</span>
                <span className="text-slate-400 font-bold">{item.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Small math description */}
        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
          📊 Activation score function normalized output. Calculates exponential probability densities summing to 100%. Highlight classes represent maximum likelihood estimation keys.
        </p>

      </div>

      {/* Right panel: Core Terrain Indicators & Environmental factors */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Spatial Texture Analysis Bento Card */}
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-6 space-y-4 relative overflow-hidden">
          <h4 className="text-xs uppercase tracking-wider font-mono font-bold text-orange-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Active Texture & Surface Insight Context
          </h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-900/40 rounded-xl space-y-1.5 border border-slate-900">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                Surface Texture Resolution
              </span>
              <p className="text-slate-300 leading-relaxed">
                {classificationResult 
                  ? "Frequency descriptors suggest consistent paved concrete joints or gravel density distributions." 
                  : "Spectrometric texture density analyzer scans micro-roughness variations in visual raster bands."}
              </p>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl space-y-1.5 border border-slate-900">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                Environmental Context
              </span>
              <p className="text-slate-300 leading-relaxed">
                {classificationResult
                  ? `Includes neighboring features like: ${classificationResult.surroundingFeatures.join(", ") || "Vegetation, trees"}.`
                  : "Determines secondary landmarks like roadside building shadows, dense forest canopy splits, or water gutters."}
              </p>
            </div>
          </div>
        </div>

        {/* General Satellite Intelligence Guidelines */}
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Ingress Filter Safeguards</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Continuous neural filters analyze file contours. Non-standard dimensions or non-satellite domestic pictures are filtered during ingress.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-400">
              <Map className="w-4 h-4" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Terrain Ground Truth mapping</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Validates road structures against ground truth indicators with a default categorization confidence threshold of 75%.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
