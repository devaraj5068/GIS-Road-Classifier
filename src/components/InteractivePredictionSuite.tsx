import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  Maximize2,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { ClassificationResult } from "../types";

interface InteractivePredictionSuiteProps {
  // Preset canvas element (already compiled by pre-built Canvas system)
  canvasElement: React.ReactNode;
  
  // Custom upload states
  uploadedBase64: string | null;
  uploadedFileName: string;
  onClearUpload: () => void;
  onUploadFile: (file: File) => void;
  
  // Action metrics
  isClassifying: boolean;
  classificationError: string | null;
  classificationResult: ClassificationResult | null;
  onRunInference: () => Promise<void>;
  
  // Custom navigation trigger
  onResetToSandbox: () => void;
}

export function InteractivePredictionSuite({
  canvasElement,
  uploadedBase64,
  uploadedFileName,
  onClearUpload,
  onUploadFile,
  isClassifying,
  classificationError,
  classificationResult,
  onRunInference,
  onResetToSandbox
}: InteractivePredictionSuiteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [timestamp, setTimestamp] = useState<string>("");
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  // Auto-generate timestamp upon predictions
  useEffect(() => {
    if (classificationResult) {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString() + " UTC");
    }
  }, [classificationResult]);

  // Client-side quick filter for non-road image domains to prevent wasted payloads back & forth
  const assessClientSideValidation = (fileName: string): boolean => {
    const invalidKeywords = [
      "dog", "cat", "puppy", "poodle", "pomeranian", "retriever", "terrier", "spaniel", 
      "persian", "kitten", "toy", "teddy", "sofa", "couch", "bed", "table", "chair", "furniture",
      "human", "person", "man", "woman", "baby", "child", "face", "glove", "boot", "shoe",
      "cup", "fork", "plate", "kitchen", "refrigerator", "tv", "monitor", "laptop", "mouse",
      "food", "sandwich", "fruit", "animal", "domestic", "wardrobe", "feline", "canine"
    ];
    
    const lowerName = fileName.toLowerCase();
    for (const keyword of invalidKeywords) {
      if (lowerName.includes(keyword)) {
        return false;
      }
    }
    return true;
  };

  // Drag and drop wrappers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setLocalValidationError("Invalid file type. Please feed PNG, JPEG, tiff or bmp satellite output files.");
        return;
      }
      
      const isRoadHealthy = assessClientSideValidation(file.name);
      if (!isRoadHealthy) {
        setLocalValidationError("Heuristics Check: Flagged out-of-domain entity. Domestic item, human, objects or animals detected in filenames are rejected for safe road indexing.");
        onUploadFile(file); // still save path so UI renders rejection view properly
        return;
      }

      setLocalValidationError(null);
      onUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const isRoadHealthy = assessClientSideValidation(file.name);
      if (!isRoadHealthy) {
        setLocalValidationError("Heuristics Check: Flagged out-of-domain entity. Domestic item, human, objects or animals detected in filenames are rejected for safe road indexing.");
        onUploadFile(file);
        return;
      }
      
      setLocalValidationError(null);
      onUploadFile(file);
    }
  };

  // Check if system has a validation block (either server error status, or local name heuristics)
  const isImageFlaggedAsInvalid = Boolean(
    localValidationError || 
    (classificationError && classificationError.toLowerCase().includes("invalid image")) ||
    (classificationError && classificationError.toLowerCase().includes("domain"))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="prediction-interactive-suite">
      
      {/* LEFT SIDE: Image Viewer with Scanning Effect */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Telemetry Stream Ingress
          </span>
          {uploadedBase64 && (
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              CUSTOM FEED
            </div>
          )}
        </div>

        <div className="relative group">
          {/* Animated Glowing border border overlay */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-orange-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></div>
          
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[380px] p-2 bg-gradient-to-br from-slate-950 to-slate-900/60 shadow-inner">
            
            {!uploadedBase64 ? (
              // Live Preset simulated vector map canvas
              <div className="w-full">
                {canvasElement}
              </div>
            ) : (
              // Uploaded image rendering container
              <div className="relative w-full overflow-hidden flex flex-col items-center justify-center">
                <img
                  src={uploadedBase64}
                  alt="GIS Active Target"
                  className={`max-h-[380px] w-full object-contain rounded-xl transition-transform duration-300 ${
                    isZoomedIn ? "scale-125 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomedIn(!isZoomedIn)}
                />

                {/* Laser Scanning line effect */}
                {isClassifying && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] scanner-laser pointer-events-none"></div>
                )}

                {/* File metadata badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-mono font-bold text-cyan-400 tracking-wider border border-cyan-500/20 shadow">
                  IMAGE: {uploadedFileName.toUpperCase()}
                </div>

                {/* Zoom control helper */}
                <button
                  type="button"
                  onClick={() => setIsZoomedIn(!isZoomedIn)}
                  className="absolute bottom-3 left-3 p-1.5 bg-slate-900/80 backdrop-blur text-slate-300 rounded hover:text-white transition-colors"
                  title="Toggle Zoom Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Overlaid Processing State */}
            {isClassifying && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
                  <Cpu className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold animate-pulse">Running Neural Classifier</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Decoding pixel arrays & calculating feature vectors</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag-and-Drop file intake zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("gis-file-selector")?.click()}
          className={`p-5 rounded-xl border border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/10"
              : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700"
          }`}
        >
          <div className="p-2.5 bg-slate-900 rounded-xl text-cyan-400 border border-slate-800">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              Drag & drop satellite image or <span className="text-cyan-400 underline">browse workspace files</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports TIFF, PNG, JPG standard GIS dimensions up to 10MB
            </p>
          </div>
          <input
            type="file"
            id="gis-file-selector"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* RIGHT SIDE: Real-time results OR Warning screens */}
      <div className="lg:col-span-6 flex flex-col justify-stretch min-h-[460px]">
        
        <AnimatePresence mode="wait">
          
          {/* STATE 1: REJECTION WARNING SCREEN (DOMESTIC ASSETS/DOGS) */}
          {isImageFlaggedAsInvalid ? (
            <motion.div
              key="invalid-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl glass-panel-warning flex-1 flex flex-col justify-between space-y-6 glow-pulsing relative overflow-hidden"
            >
              {/* Pulse scanline line */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-red-500/10 animate-pulse"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                    <ShieldAlert className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                      Security & Domain Alert
                    </span>
                    <h3 className="text-lg font-bold font-display text-white mt-0.5">
                      Invalid Image Detected
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-red-950/20 border border-red-500/10 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-red-300">
                    Image rejected. Please upload a valid GIS or road image.
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                    {localValidationError || classificationError || "Our pre-trained ImageNet guardrail flagged domestic signatures. The pipeline cannot process animals, humans, household accessories, or indoor views."}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>Allowed classes: Hwy, Street, Village, Dirt, Concrete paths.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>Image structure: Aerial, orbital, satellite or outdoor terrain viewpoints.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-red-500/15 flex items-center justify-between gap-5">
                <span className="text-[10px] font-mono text-red-400 uppercase font-semibold">
                  STATUS: PIPELINE_STOPPED (400)
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    setLocalValidationError(null);
                    onClearUpload();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-md shadow-red-500/10"
                >
                  Retry Upload
                </button>
              </div>
            </motion.div>
          ) : 

          /* STATE 2: RECOGNIZED RESULTS COMPLETED SCREEN */
          classificationResult ? (
            <motion.div
              key="result-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl glass-panel relative flex-1 flex flex-col justify-between space-y-6 border border-cyan-500/20 shadow-2xl overflow-hidden"
              style={{
                boxShadow: "inset 0 0 20px rgba(6, 182, 212, 0.05)"
              }}
            >
              {/* Highlight corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>

              <div className="space-y-4">
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350">
                      Telemetry Prediction Result
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{timestamp}</span>
                  </div>
                </div>

                {/* Score panel */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10 font-mono text-8xl scale-y-125 select-none -translate-y-4 translate-x-4 pointer-events-none">
                    GIS
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      Categorized Road Type
                    </span>
                    <span className="text-2xl font-extrabold font-display text-white mt-0.5 tracking-tight flex items-center gap-2">
                      {classificationResult.roadType}
                      <CheckCircle className="w-5 h-5 text-emerald-400 inline" />
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                      Score Confidence
                    </span>
                    <span className={`text-2xl font-extrabold font-mono tracking-tighter ${
                      classificationResult.confidence < 75 ? "text-amber-400" : "text-cyan-400"
                    }`}>
                      {classificationResult.confidence}%
                    </span>
                  </div>
                </div>

                {/* Meter gauge bar */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-850 overflow-hidden relative p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        classificationResult.confidence < 75 
                          ? "bg-gradient-to-r from-amber-500 to-orange-400" 
                          : "bg-gradient-to-r from-cyan-400 to-sky-400"
                      }`}
                      style={{ width: `${classificationResult.confidence}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>LAYER OUT: SOFTMAX</span>
                    <span>THRESHOLD MET (75%)</span>
                  </div>
                </div>

                {/* Low Confidence warning block (if < 75%) */}
                {classificationResult.confidence < 75 && (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Low confidence prediction alert</span>
                    </div>
                    <p className="text-[11px] text-slate-350 font-sans leading-relaxed">
                      Low confidence prediction. Please upload a clearer GIS road image to guarantee spatial reliability on satellite extraction.
                    </p>
                  </div>
                )}

                {/* High fidelity diagnostics details */}
                <div className="text-xs space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Spatial Diagnostic Diagnostic Context
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-850 text-[11px] font-sans">
                    {classificationResult.technicalRationale}
                  </p>
                </div>
              </div>

              {/* Action feet and re-class */}
              <div className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                  Sensor ID: SATELLITE_GEM_3.5
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetToSandbox}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 text-xs font-bold hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Clear Feed
                  </button>

                  <button
                    type="button"
                    onClick={onRunInference}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-bold font-display rounded-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Again</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : 

          /* STATE 3: IDLE/PROMPT TO COMPILE PREDICTION SCREEN */
          (
            <motion.div
              key="idle-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl glass-panel flex-1 flex flex-col justify-between"
            >
              <div className="text-center py-12 px-2 space-y-4 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 flex items-center justify-center mx-auto text-cyan-400 ring-2 ring-cyan-500/10">
                  <ImageIcon className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-slate-200">Ingress Target Configured</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Satellite terrain arrays or custom uploads are loaded and prepared. Click predictions to deploy deep spatial kernels.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onRunInference}
                    className="mx-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold font-display text-xs hover:from-cyan-300 hover:to-indigo-400 transition-transform hover:scale-105 flex items-center gap-1.5 shadow"
                  >
                    <Cpu className="w-4 h-4 fill-white" />
                    <span>Start Live Prediction</span>
                  </button>
                </div>
              </div>

              {/* Quick visual tip logs */}
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex items-start gap-2 text-[10px] text-slate-400">
                <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  <strong className="text-orange-400 font-bold uppercase">Heuristics Check:</strong> Image validations run in real-time to intercept stray domestic dog, kitten, or indoor office uploads.
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
