import { useEffect, useRef } from "react";

interface GisMapCanvasProps {
  type: "highway" | "street" | "village" | "dirt" | "concrete";
  width?: number;
  height?: number;
  onCapture?: (base64: string) => void;
  triggerCapture?: boolean;
}

export function GisMapCanvas({
  type,
  width = 600,
  height = 400,
  onCapture,
  triggerCapture
}: GisMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas and Draw satellite background (Default: Rich Grass Green)
    ctx.fillStyle = "#1e3f20"; // Forest green base
    ctx.fillRect(0, 0, width, height);

    // Draw some organic field textures/farmland grids
    ctx.fillStyle = "#274e13"; // Darker green
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.floor((Math.sin(i) * 0.5 + 0.5) * width),
        Math.floor((Math.cos(i * 2.3) * 0.5 + 0.5) * height),
        50 + (i % 3) * 30,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw agricultural/urban grid lines to look like GIS overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render road type specific vectors
    if (type === "highway") {
      drawHighway(ctx, width, height);
    } else if (type === "street") {
      drawStreetRoad(ctx, width, height);
    } else if (type === "village") {
      drawVillageRoad(ctx, width, height);
    } else if (type === "dirt") {
      drawDirtRoad(ctx, width, height);
    } else if (type === "concrete") {
      drawConcreteRoad(ctx, width, height);
    }

    // Capture base64 representation of the canvas for our classifier model
    if (onCapture) {
      onCapture(canvas.toDataURL("image/png"));
    }
  }, [type, width, height, triggerCapture]);

  const drawHighway = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Large 4-lane asphalt highway cutting diagonally
    ctx.save();
    
    // Draw road shoulder/dirt buffer
    ctx.strokeStyle = "#8e7c65"; // Sandy gravel shoulder
    ctx.lineWidth = 110;
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 40);
    ctx.lineTo(w + 50, h / 2 + 40);
    ctx.stroke();

    // Draw dark asphalt
    ctx.strokeStyle = "#323538"; // Charcoal grey asphalt
    ctx.lineWidth = 90;
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 40);
    ctx.lineTo(w + 50, h / 2 + 40);
    ctx.stroke();

    // Solid white outer lines
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    // Top boundary
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 82);
    ctx.lineTo(w + 50, h / 2 - 2);
    ctx.stroke();
    // Bottom boundary
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 + 2);
    ctx.lineTo(w + 50, h / 2 + 82);
    ctx.stroke();

    // Double solid yellow center divider
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 42);
    ctx.lineTo(w + 50, h / 2 + 38);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 38);
    ctx.lineTo(w + 50, h / 2 + 42);
    ctx.stroke();

    // Dashed lane divider lines (white, 2 lanes left, 2 lanes right)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([15, 20]);
    // Top lane splitter
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 60);
    ctx.lineTo(w + 50, h / 2 + 20);
    ctx.stroke();
    // Bottom lane splitter
    ctx.beginPath();
    ctx.moveTo(-50, h / 2 - 20);
    ctx.lineTo(w + 50, h / 2 + 60);
    ctx.stroke();
    ctx.restore();

    // Draw some high-speed vehicles moving on the highway
    drawMockVehicle(ctx, 120, h / 2 - 22, "#e74c3c", 22, 10, 15); // Red car
    drawMockVehicle(ctx, 380, h / 2 + 10, "#3498db", 24, 10, -15); // Blue car
    drawMockVehicle(ctx, 220, h / 2 + 35, "#f39c12", 42, 12, -15); // Semi truck
  };

  const drawStreetRoad = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Grid urban street with surrounding building structures
    ctx.fillStyle = "#2c3e50"; // Dark asphalt
    
    // Grey neighborhood blocks background
    ctx.fillStyle = "#7f8c8d";
    ctx.fillRect(50, 40, 120, h - 80);
    ctx.fillRect(w - 170, 40, 120, h - 80);

    // Main horizontal street
    ctx.fillStyle = "#3c3f41";
    ctx.fillRect(0, h / 2 - 35, w, 70);

    // Sidewalk lines
    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(0, h / 2 - 42, w, 7);
    ctx.fillRect(0, h / 2 + 35, w, 7);

    // Crosswalk on the left side
    ctx.fillStyle = "#ffffff";
    const xwalkX = 110;
    for (let offset = -30; offset < 35; offset += 10) {
      ctx.fillRect(xwalkX, h / 2 + offset, 16, 6);
    }

    // Yellow dashed center line
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Structured buildings on either side (Bento boxes)
    ctx.fillStyle = "#95a5a6";
    // Neighborhood 1
    drawBuilding(ctx, 70, 60, 40, 40, "#c0392b");
    drawBuilding(ctx, 120, 120, 35, 45, "#d35400");
    drawBuilding(ctx, 70, 220, 40, 40, "#2980b9");
    drawBuilding(ctx, 120, 280, 40, 40, "#27ae60");

    // Neighborhood 2
    drawBuilding(ctx, w - 150, 60, 45, 50, "#16a085");
    drawBuilding(ctx, w - 100, 130, 40, 40, "#c0392b");
    drawBuilding(ctx, w - 150, 210, 40, 45, "#8e44ad");
    drawBuilding(ctx, w - 100, 270, 45, 40, "#2c3e50");

    // Draw some street signs or parked cars
    drawMockVehicle(ctx, 280, h / 2 - 15, "#1abc9c", 18, 9, 0); // Green sedan
    drawMockVehicle(ctx, 80, h / 2 + 15, "#f1c40f", 20, 9, 180); // Taxi
  };

  const drawVillageRoad = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Village setting: high organic green cover, thin winding paving with clay edges
    
    // Draw winding river/creek nearby
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(-10, h - 30);
    ctx.bezierCurveTo(w * 0.3, h - 10, w * 0.5, h - 70, w + 10, h - 20);
    ctx.stroke();

    // Road shoulder (dirt transition)
    ctx.strokeStyle = "#7e6244";
    ctx.lineWidth = 32;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(w / 2, -20);
    ctx.bezierCurveTo(w / 2 + 100, h * 0.3, w / 2 - 120, h * 0.6, w / 2 + 20, h + 20);
    ctx.stroke();

    // Narrow paving
    ctx.strokeStyle = "#5a5c5e";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(w / 2, -20);
    ctx.bezierCurveTo(w / 2 + 100, h * 0.3, w / 2 - 120, h * 0.6, w / 2 + 20, h + 20);
    ctx.stroke();

    // No center lines (village tracks are unmarked!)
    // Draw scattered rural huts (Brown boxes with dark thatched roofs)
    drawRuralHut(ctx, 120, 80);
    drawRuralHut(ctx, 420, 100);
    drawRuralHut(ctx, 160, h - 120);
    drawRuralHut(ctx, w - 150, h - 140);

    // Draw rich dense tree canopies overlapping the roads
    const treeCoords = [
      [80, 50, 24], [250, 40, 28], [280, 130, 20],
      [150, 280, 30], [w - 180, 220, 26], [w - 100, 310, 32],
      [w / 2 + 50, h * 0.4, 22], [w / 2 - 60, h * 0.5, 25]
    ];
    ctx.fillStyle = "rgba(10, 60, 10, 0.75)";
    treeCoords.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
      // Highlight canopy ring
      ctx.strokeStyle = "#27ae60";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawDirtRoad = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Reddish-clay mud/dirt winding track with distinct double wheel groove textures
    ctx.fillStyle = "#8a6d4b"; // Clay dirt landscape base
    ctx.fillRect(0, 0, w, h);

    // Add rocky patch textures
    ctx.fillStyle = "#7c603a";
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.floor((Math.sin(i * 1.5) * 0.5 + 0.5) * w),
        Math.floor((Math.cos(i * 2.8) * 0.5 + 0.5) * h),
        30 + (i % 4) * 20,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Dirt road path (wide rugged buffer)
    ctx.strokeStyle = "#4d3920"; // Dark dirt channel
    ctx.lineWidth = 55;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Winding path
    const curvePoints = () => {
      ctx.beginPath();
      ctx.moveTo(-20, h / 2 - 50);
      ctx.bezierCurveTo(w * 0.25, h / 2 + 80, w * 0.75, h / 2 - 120, w + 20, h / 2 + 40);
    };

    curvePoints();
    ctx.stroke();

    // Main mud-clay track core
    ctx.strokeStyle = "#b38f5f"; // Lighter clay dirt
    ctx.lineWidth = 44;
    curvePoints();
    ctx.stroke();

    // Double linear darker grooves (tire tracks!)
    ctx.strokeStyle = "#5c4013"; // Dark wheel grooves
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 8]);
    
    // Left Groove
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-20, h / 2 - 62);
    ctx.bezierCurveTo(w * 0.25, h / 2 + 68, w * 0.75, h / 2 - 132, w + 20, h / 2 + 28);
    ctx.stroke();

    // Right Groove
    ctx.beginPath();
    ctx.moveTo(-20, h / 2 - 38);
    ctx.bezierCurveTo(w * 0.25, h / 2 + 92, w * 0.75, h / 2 - 108, w + 20, h / 2 + 52);
    ctx.stroke();
    ctx.restore();

    // Draw mud pools on path
    ctx.fillStyle = "rgba(42, 30, 10, 0.65)";
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h / 2 + 5, 25, 12, Math.PI / 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(w * 0.75, h / 2 - 35, 18, 8, -Math.PI / 12, 0, 2 * Math.PI);
    ctx.fill();

    // Forest canopy bordering edges
    ctx.fillStyle = "#1b3310";
    // Top border forests
    ctx.beginPath();
    for (let x = 0; x <= w + 40; x += 60) {
      ctx.arc(x, 10, 45, 0, 2 * Math.PI);
    }
    ctx.fill();
    
    // Bottom border forests
    ctx.beginPath();
    for (let x = 0; x <= w + 40; x += 60) {
      ctx.arc(x, h - 10, 45, 0, 2 * Math.PI);
    }
    ctx.fill();
  };

  const drawConcreteRoad = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Concrete road: light silver-grey surface, expansion joints (lines), texturing slabs
    ctx.save();
    
    // Render road shoulder line
    ctx.strokeStyle = "#27ae60"; // Grass margin
    ctx.lineWidth = 100;
    ctx.beginPath();
    ctx.moveTo(-20, h - 120);
    ctx.lineTo(w + 20, 60);
    ctx.stroke();

    // Main light concrete base block
    ctx.strokeStyle = "#b2b8bd"; // Medium concrete grey
    ctx.lineWidth = 75;
    ctx.beginPath();
    ctx.moveTo(-20, h - 120);
    ctx.lineTo(w + 20, 60);
    ctx.stroke();

    ctx.strokeStyle = "#ccd1d9"; // Lighter concrete center slab
    ctx.lineWidth = 68;
    ctx.beginPath();
    ctx.moveTo(-20, h - 120);
    ctx.lineTo(w + 20, 60);
    ctx.stroke();

    // Render structural dark-black asphaltic joints (transverse lines) at intervals
    ctx.strokeStyle = "#3e4245"; // Expansion joint tar sealer
    ctx.lineWidth = 2.5;
    
    // Math to draw lines perpendicular to the diagonal road
    // Road vector goes from (-20, h - 120) to (w+20, 60)
    // Dynamic perpendicular expansion joint panels
    const intervals = [0.15, 0.35, 0.55, 0.75, 0.95];
    intervals.forEach(t => {
      const rx = -20 + (w + 40) * t;
      const ry = (h - 120) + (180 - h) * t;
      
      // Calculate perpendicular offset unit vector
      // road angle = atan2(dy, dx)
      const dx = w + 40;
      const dy = 180 - h;
      const angle = Math.atan2(dy, dx);
      const perpAngle = angle + Math.PI / 2;

      const jointLen = 35;
      const x1 = rx + Math.cos(perpAngle) * jointLen;
      const y1 = ry + Math.sin(perpAngle) * jointLen;
      const x2 = rx - Math.cos(perpAngle) * jointLen;
      const y2 = ry - Math.sin(perpAngle) * jointLen;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Longitudinal center joint (thin tile line)
    ctx.strokeStyle = "rgba(40, 42, 45, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-20, h - 120);
    ctx.lineTo(w + 20, 60);
    ctx.stroke();

    ctx.restore();

    // Draw some typical concrete structures around (e.g. industrial yard paths)
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(30, 40, 100, 70);
    ctx.strokeStyle = "#95a5a6";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 40, 100, 70);

    // Texturing labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic Bold 10px monospace";
    ctx.fillText("GIS PRESET 4 // SUB-GRADE CONCRETE PATH", 15, h - 15);
  };

  // Helper drawers
  const drawBuilding = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(x, y, w, h);
    
    // Draw interior roof grid/rim
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    ctx.restore();
  };

  const drawRuralHut = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 2, y + 2, 22, 18);

    // Clay walls
    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(x, y, 20, 16);

    // Thatched thatch brown roof
    ctx.fillStyle = "#967246";
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 3);
    ctx.lineTo(x + 10, y - 6);
    ctx.lineTo(x + 23, y + 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawMockVehicle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    color: string,
    vLen: number,
    vWid: number,
    angleDeg: number
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angleDeg * Math.PI) / 180);

    // Vehicle Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-vLen / 2 + 1, -vWid / 2 + 2, vLen, vWid);

    // Vehicle Core Body
    ctx.fillStyle = color;
    ctx.fillRect(-vLen / 2, -vWid / 2, vLen, vWid);

    // Windshield (Black or glass cyan)
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(vLen * 0.1, -vWid / 2 + 1, vLen * 0.2, vWid - 2);

    // Headlights
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(vLen / 2 - 2, -vWid / 2 + 1, 2, 2);
    ctx.fillRect(vLen / 2 - 2, vWid / 2 - 3, 2, 2);

    ctx.restore();
  };

  return (
    <div className="relative border border-slate-600 rounded bg-black/40 overflow-hidden shadow-inner flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block max-w-full h-auto bg-slate-900 cursor-crosshair rounded"
      />
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 rounded text-[10px] font-mono font-medium text-amber-500 tracking-widest border border-amber-500/20">
        GIS VECTOR OUTPUT: {type.toUpperCase()}
      </div>
    </div>
  );
}
