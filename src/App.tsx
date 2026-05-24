import React, { useState, useEffect } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { HeroSection } from "./components/HeroSection";
import { CategoryQuickCards } from "./components/CategoryQuickCards";
import { InteractivePredictionSuite } from "./components/InteractivePredictionSuite";
import { AIPredictionAnalysisPanel } from "./components/AIPredictionAnalysisPanel";
import { Footer } from "./components/Footer";
import { GisMapCanvas } from "./components/GisMapCanvas";
import { ClassificationResult } from "./types";

export default function App() {
  // Preset simulation states
  const [selectedPresetType, setSelectedPresetType] = useState<"highway" | "street" | "village" | "dirt" | "concrete">("highway");
  const [currentCanvasBase64, setCurrentCanvasBase64] = useState<string>("");
  const [triggerCanvasDraw, setTriggerCanvasDraw] = useState<boolean>(false);

  // Custom User Image File states
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Classification API states
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);

  // System general sensor status descriptor
  const [systemStatus, setSystemStatus] = useState<"idle" | "scanning" | "error" | "validated">("idle");

  // Keep tracking status updates
  useEffect(() => {
    if (isClassifying) {
      setSystemStatus("scanning");
    } else if (classificationError) {
      setSystemStatus("error");
    } else if (classificationResult) {
      setSystemStatus("validated");
    } else {
      setSystemStatus("idle");
    }
  }, [isClassifying, classificationError, classificationResult]);

  // Select Preset vector map simulator and clear previous uploads
  const handleSelectCategory = (type: "highway" | "street" | "village" | "dirt" | "concrete") => {
    setSelectedPresetType(type);
    setUploadedBase64(null); // Clear custom upload so preset returns as active
    setUploadedFileName("");
    setClassificationResult(null);
    setClassificationError(null);
    setTriggerCanvasDraw(prev => !prev);
  };

  // Safe file loader setting states
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedBase64(reader.result);
        setUploadedFileName(file.name);
        setClassificationResult(null);
        setClassificationError(null);
      }
    };
    reader.onerror = () => {
      setClassificationError("I/O error: Failed to parse user image stream.");
    };
    reader.readAsDataURL(file);
  };

  const handleClearUpload = () => {
    setUploadedBase64(null);
    setUploadedFileName("");
    setClassificationResult(null);
    setClassificationError(null);
  };

  // Run CNN satellite prediction model (handles proxy requests using server.ts)
  const handleRunClassification = async () => {
    setIsClassifying(true);
    setClassificationError(null);
    setClassificationResult(null);

    const activeImageBase64 = uploadedBase64 || currentCanvasBase64;
    const isPreset = !uploadedBase64;

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: activeImageBase64,
          mimeType: "image/png",
          roadClassHint: isPreset ? selectedPresetType : undefined
        })
      });

      if (!response.ok) {
        let errorMsg = `Server validation returned code ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {
          // Ignore parsing issues
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setClassificationResult(result);
    } catch (err: any) {
      console.error(err);
      setClassificationError(err.message || "Failed to finalize connection. Please verify API configurations.");
    } finally {
      setIsClassifying(false);
    }
  };

  // Programmatic helper to trigger upload action
  const handleTriggerUploadClick = () => {
    document.getElementById("gis-file-selector")?.click();
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-100" id="gis-workspace-app">
      
      {/* Dynamic Header */}
      <DashboardHeader 
        apiKeyActive={true} 
        systemStatus={systemStatus} 
      />

      {/* Main Core Dashboard Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8 space-y-10" id="main-telemetry-panel">
        
        {/* Hero Section Banner */}
        <HeroSection 
          onTriggerUpload={handleTriggerUploadClick}
          onTriggerPrediction={handleRunClassification}
          isReady={true}
        />

        {/* 5 clickables visual cards */}
        <CategoryQuickCards 
          onSelectCategory={handleSelectCategory}
          activeId={selectedPresetType}
          isPresetActive={!uploadedBase64}
        />

        {/* Dynamic Analyzer Suite Grid */}
        <InteractivePredictionSuite 
          canvasElement={
            <GisMapCanvas 
              type={selectedPresetType}
              onCapture={(base64) => setCurrentCanvasBase64(base64)}
              triggerCapture={triggerCanvasDraw}
              width={560}
              height={360}
            />
          }
          uploadedBase64={uploadedBase64}
          uploadedFileName={uploadedFileName}
          onClearUpload={handleClearUpload}
          onUploadFile={handleUploadFile}
          isClassifying={isClassifying}
          classificationError={classificationError}
          classificationResult={classificationResult}
          onRunInference={handleRunClassification}
          onResetToSandbox={handleClearUpload}
        />

        {/* Mathematical softmax distribution insights panel */}
        <AIPredictionAnalysisPanel 
          classificationResult={classificationResult}
        />

      </main>

      {/* Professional Dashboard Footer */}
      <Footer />

    </div>
  );
}
