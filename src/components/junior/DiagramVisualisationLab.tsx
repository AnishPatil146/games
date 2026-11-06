"use client";

import React, { useState } from "react";
import {
  Compass,
  RotateCcw,
  Info,
  Layers,
} from "lucide-react";
import {
  DIAGRAM_SIMULATION_CATALOGUE,
  SimulationDomain,
} from "@/lib/junior/diagram-lab-data";

export function DiagramVisualisationLab() {
  const [selectedSimId, setSelectedSimId] = useState<string>("sim-math-unit-circle");
  const [selectedDomain, setSelectedDomain] = useState<SimulationDomain | "all">("all");

  const activeSim =
    DIAGRAM_SIMULATION_CATALOGUE.find((s) => s.id === selectedSimId) ||
    DIAGRAM_SIMULATION_CATALOGUE[0];

  // Parameter state dictionary
  const [paramValues, setParamValues] = useState<Record<string, number>>({
    angleDeg: 45,
    objectDistance: 35,
    focalLength: 20,
    objectHeight: 20,
    launchVelocity: 30,
    launchAngle: 45,
    circuitVoltage: 12,
    circuitResistance: 10,
    geometryType: 3,
    cellType: 1,
    yearIndex: 2,
  });

  const handleParamChange = (id: string, val: number) => {
    setParamValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleResetParams = () => {
    const defaults: Record<string, number> = {};
    activeSim.parameters.forEach((p) => {
      defaults[p.id] = p.defaultValue;
    });
    setParamValues((prev) => ({ ...prev, ...defaults }));
  };

  const filteredSims =
    selectedDomain === "all"
      ? DIAGRAM_SIMULATION_CATALOGUE
      : DIAGRAM_SIMULATION_CATALOGUE.filter((s) => s.domain === selectedDomain);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <Compass className="w-3 h-3" />
              Interactive Lab
            </span>
            <span className="text-zinc-500 text-xs">·</span>
            <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Visualisations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
            Diagram & Visualisation Laboratory
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            Real-time interactive mathematical graphs, optical ray tracing, kinematics trajectories, circuit dynamics, and molecular architectures. Adjust physical variables to verify theoretical laws.
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          {(["all", "mathematics", "physics", "chemistry", "biology", "humanities"] as const).map(
            (domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                  selectedDomain === domain
                    ? "bg-[#FAF7F2] text-[#12100E] font-bold shadow-sm"
                    : "bg-[#221D1A] text-zinc-400 hover:text-zinc-200 border border-[#382F2A]"
                }`}
              >
                {domain}
              </button>
            )
          )}
        </div>
      </div>

      {/* 2. Main Simulation Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 px-1 flex items-center justify-between">
            <span>Available Modules ({filteredSims.length})</span>
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredSims.map((sim) => {
              const isActive = sim.id === activeSim.id;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setSelectedSimId(sim.id)}
                  className={`w-full text-left p-3.5 rounded border transition-all ${
                    isActive
                      ? "bg-[#251E1A] border-amber-500/60 shadow-md ring-1 ring-amber-500/30"
                      : "bg-[#181412] border-[#2A221D] hover:border-zinc-600 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#100D0B] text-amber-400 border border-amber-500/20">
                      Class {sim.classLevel} · {sim.domain}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{sim.subjectName}</span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#FAF7F2] line-clamp-1">
                    {sim.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {sim.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Simulation Stage & Parameter Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#14100E] border border-[#2F2722] rounded-md p-5 shadow-xl">
            {/* Stage Masthead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28211C] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  {activeSim.chapterTitle}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#FAF7F2] mt-0.5">
                  {activeSim.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetParams}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-[#201A16] border border-[#332A24] rounded transition-colors self-start sm:self-auto"
                title="Reset simulation variables to standard defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Instruction Callout */}
            <div className="bg-[#1B1613] border border-[#3A2F28] rounded p-2.5 mb-4 text-xs text-amber-200/90 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{activeSim.instructionPrompt}</span>
            </div>

            {/* Render Canvas by Simulation ID */}
            <div className="bg-[#0A0807] border border-[#231B16] rounded-md p-4 min-h-[320px] flex items-center justify-center relative overflow-hidden">
              {activeSim.id === "sim-math-unit-circle" && (
                <UnitCircleVisualiser angleDeg={paramValues.angleDeg ?? 45} />
              )}
              {activeSim.id === "sim-physics-ray-optics" && (
                <RayOpticsVisualiser
                  objectDistance={paramValues.objectDistance ?? 35}
                  focalLength={paramValues.focalLength ?? 20}
                  objectHeight={paramValues.objectHeight ?? 20}
                />
              )}
              {activeSim.id === "sim-physics-projectile" && (
                <ProjectileVisualiser
                  velocity={paramValues.launchVelocity ?? 30}
                  angleDeg={paramValues.launchAngle ?? 45}
                />
              )}
              {activeSim.id === "sim-physics-dc-circuit" && (
                <DcCircuitVisualiser
                  voltage={paramValues.circuitVoltage ?? 12}
                  resistance={paramValues.circuitResistance ?? 10}
                />
              )}
              {activeSim.id === "sim-chem-vsepr" && (
                <VseprVisualiser typeIndex={paramValues.geometryType ?? 3} />
              )}
              {activeSim.id === "sim-bio-cell-architecture" && (
                <CellVisualiser cellType={paramValues.cellType ?? 1} />
              )}
              {activeSim.id === "sim-humanities-timeline" && (
                <TimelineVisualiser stageIndex={paramValues.yearIndex ?? 2} />
              )}
            </div>

            {/* Interactive Parameter Sliders */}
            <div className="mt-5 pt-4 border-t border-[#28211C] space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Interactive Controls & Physical Variables
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSim.parameters.map((param) => {
                  const currVal = paramValues[param.id] ?? param.defaultValue;
                  return (
                    <div
                      key={param.id}
                      className="bg-[#1C1714] border border-[#2E2520] rounded p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-300">
                          {param.name} ({param.symbol})
                        </span>
                        <span className="font-mono font-bold text-amber-400 bg-[#120E0C] px-2 py-0.5 rounded border border-[#382E27]">
                          {currVal} {param.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={currVal}
                        onChange={(e) =>
                          handleParamChange(param.id, parseFloat(e.target.value))
                        }
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2B231E] rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>
                          {param.min} {param.unit}
                        </span>
                        <span>
                          {param.max} {param.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific Key Principles */}
            <div className="mt-5 pt-4 border-t border-[#28211C] space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                Theoretical Axioms & Governing Principles
              </span>
              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                {activeSim.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SIMULATION CANVAS IMPLEMENTATIONS
// ============================================================================

function UnitCircleVisualiser({ angleDeg }: { angleDeg: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const tanVal = Math.abs(cosVal) > 0.01 ? (sinVal / cosVal).toFixed(3) : "Undefined (±∞)";

  // Canvas coordinate mapping: center at (150, 150), radius R = 100
  const R = 100;
  const cx = 150;
  const cy = 150;
  const px = cx + R * cosVal;
  const py = cy - R * sinVal; // canvas y is inverted

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-around py-2">
      {/* SVG Unit Circle */}
      <div className="relative">
        <svg width="300" height="300" className="bg-[#0D0A09] rounded border border-[#2E241E]">
          {/* Coordinate Axes */}
          <line x1="20" y1="150" x2="280" y2="150" stroke="#44372F" strokeWidth="1.5" />
          <line x1="150" y1="20" x2="150" y2="280" stroke="#44372F" strokeWidth="1.5" />

          {/* Unit Circle */}
          <circle cx="150" cy="150" r={R} fill="none" stroke="#685446" strokeWidth="2" strokeDasharray="4 4" />

          {/* Triangle Legs */}
          {/* Horizontal leg (cos) */}
          <line x1="150" y1="150" x2={px} y2="150" stroke="#4C9A66" strokeWidth="3" />
          {/* Vertical leg (sin) */}
          <line x1={px} y1="150" x2={px} y2={py} stroke="#D97706" strokeWidth="3" />
          {/* Hypotenuse radius (1) */}
          <line x1="150" y1="150" x2={px} y2={py} stroke="#FAF7F2" strokeWidth="2.5" />

          {/* Angle arc */}
          <circle cx={px} cy={py} r="5" fill="#F59E0B" />

          {/* Origin and Point Labels */}
          <text x="155" y="145" fill="#A89F93" fontSize="10" fontFamily="monospace">O</text>
          <text x={px + 8} y={py - 8} fill="#FAF7F2" fontSize="11" fontFamily="monospace">
            P({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
          </text>
        </svg>
      </div>

      {/* Real-time Math Data Readout */}
      <div className="bg-[#17120F] border border-[#302620] rounded p-4 space-y-2 text-xs font-mono min-w-[220px]">
        <div className="text-zinc-400 border-b border-[#2B221B] pb-1.5 uppercase tracking-wider text-[10px]">
          Trigonometric Projections
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-400">cos({angleDeg}°) =</span>
          <span className="font-bold text-[#FAF7F2]">{cosVal.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">sin({angleDeg}°) =</span>
          <span className="font-bold text-[#FAF7F2]">{sinVal.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sky-400">tan({angleDeg}°) =</span>
          <span className="font-bold text-[#FAF7F2]">{tanVal}</span>
        </div>
        <div className="pt-2 border-t border-[#2B221B] text-[11px] text-zinc-400">
          cos²θ + sin²θ ={" "}
          <span className="text-emerald-400 font-bold">
            {(cosVal * cosVal + sinVal * sinVal).toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RayOpticsVisualiser({
  objectDistance,
  focalLength,
  objectHeight,
}: {
  objectDistance: number;
  focalLength: number;
  objectHeight: number;
}) {
  // Lens formula: 1/f = 1/v - 1/u => 1/v = 1/f + 1/u => 1/v = 1/f - 1/|u|
  const u = -objectDistance;
  const invV = 1 / focalLength + 1 / u;
  const isParallel = Math.abs(invV) < 0.0001;
  const v = isParallel ? Infinity : 1 / invV;
  const magnification = isParallel ? 0 : v / u;
  const imageH = isParallel ? 0 : objectHeight * magnification;

  // Scale: 1 cm = 4 pixels, optical center at (250, 130)
  const cx = 250;
  const cy = 130;
  const scale = 3.5;

  const objX = cx + u * scale;
  const imgX = isParallel ? cx + 250 : cx + v * scale;
  const f1X = cx - focalLength * scale;
  const f2X = cx + focalLength * scale;

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2">
      <svg width="520" height="260" className="bg-[#0C0908] rounded border border-[#2B221B] overflow-visible">
        {/* Principal Axis */}
        <line x1="10" y1={cy} x2="510" y2={cy} stroke="#483B32" strokeWidth="1.5" />

        {/* Convex Lens Line */}
        <line x1={cx} y1="30" x2={cx} y2="230" stroke="#5E96B8" strokeWidth="3" />
        <ellipse cx={cx} cy={cy} rx="8" ry="100" fill="none" stroke="#5E96B8" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Focal Points */}
        <circle cx={f1X} cy={cy} r="4" fill="#F59E0B" />
        <text x={f1X - 8} y={cy + 18} fill="#F59E0B" fontSize="10" fontFamily="monospace">F1</text>

        <circle cx={f2X} cy={cy} r="4" fill="#F59E0B" />
        <text x={f2X - 8} y={cy + 18} fill="#F59E0B" fontSize="10" fontFamily="monospace">F2</text>

        {/* Optical Center O */}
        <text x={cx + 5} y={cy + 18} fill="#A89F93" fontSize="10" fontFamily="monospace">O</text>

        {/* Object Arrow */}
        <line x1={objX} y1={cy} x2={objX} y2={cy - objectHeight * scale * 0.4} stroke="#4C9A66" strokeWidth="3" />
        <polygon
          points={`${objX},${cy - objectHeight * scale * 0.4 - 6} ${objX - 4},${cy - objectHeight * scale * 0.4} ${objX + 4},${cy - objectHeight * scale * 0.4}`}
          fill="#4C9A66"
        />
        <text x={objX - 16} y={cy - objectHeight * scale * 0.4 - 10} fill="#4C9A66" fontSize="10" fontFamily="monospace">
          Object
        </text>

        {/* Ray 1: Parallel to axis, then through F2 */}
        <line x1={objX} y1={cy - objectHeight * scale * 0.4} x2={cx} y2={cy - objectHeight * scale * 0.4} stroke="#EAB308" strokeWidth="1.5" />
        <line x1={cx} y1={cy - objectHeight * scale * 0.4} x2={500} y2={cy + (500 - cx) * ((objectHeight * scale * 0.4) / (focalLength * scale))} stroke="#EAB308" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Ray 2: Directly through Optical Center O */}
        <line x1={objX} y1={cy - objectHeight * scale * 0.4} x2={500} y2={cy - (500 - cx) * ((-objectHeight * scale * 0.4) / (u * scale))} stroke="#38BDF8" strokeWidth="1.5" />

        {/* Image Arrow (if not at infinity) */}
        {!isParallel && imgX > 20 && imgX < 500 && (
          <>
            <line x1={imgX} y1={cy} x2={imgX} y2={cy - imageH * scale * 0.4} stroke="#EF4444" strokeWidth="3" />
            <polygon
              points={`${imgX},${cy - imageH * scale * 0.4 + (imageH < 0 ? 6 : -6)} ${imgX - 4},${cy - imageH * scale * 0.4} ${imgX + 4},${cy - imageH * scale * 0.4}`}
              fill="#EF4444"
            />
            <text x={imgX - 14} y={cy - imageH * scale * 0.4 + (imageH < 0 ? 18 : -10)} fill="#EF4444" fontSize="10" fontFamily="monospace">
              Image
            </text>
          </>
        )}
      </svg>

      <div className="flex flex-wrap gap-4 text-xs font-mono bg-[#161210] border border-[#2D231C] px-4 py-2.5 rounded">
        <div>
          Image Distance (v):{" "}
          <span className="text-amber-400 font-bold">
            {isParallel ? "±∞ (At Infinity)" : `${v.toFixed(1)} cm`}
          </span>
        </div>
        <div>
          Magnification (m):{" "}
          <span className="text-amber-400 font-bold">
            {isParallel ? "N/A" : magnification.toFixed(2)}
          </span>
        </div>
        <div>
          Nature:{" "}
          <span className="text-emerald-400 font-bold">
            {isParallel
              ? "Diffused parallel beam"
              : v > 0
              ? "Real & Inverted"
              : "Virtual & Erect"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectileVisualiser({ velocity, angleDeg }: { velocity: number; angleDeg: number }) {
  const g = 9.8;
  const rad = (angleDeg * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(rad)) / g;
  const maxHeight = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * g);
  const range = (velocity * velocity * Math.sin(2 * rad)) / g;

  // Render arc points
  const points: [number, number][] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (timeOfFlight * i) / steps;
    const x = velocity * Math.cos(rad) * t;
    const y = velocity * Math.sin(rad) * t - 0.5 * g * t * t;
    points.push([x, y]);
  }

  // Scale: map range to 380px, max height to 140px
  const scaleX = 380 / Math.max(range, 30);
  const scaleY = 140 / Math.max(maxHeight, 15);
  const ox = 40;
  const oy = 180;

  const pathD = points
    .map(([x, y], idx) => `${idx === 0 ? "M" : "L"} ${ox + x * scaleX} ${oy - y * scaleY}`)
    .join(" ");

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2">
      <svg width="460" height="210" className="bg-[#0C0908] rounded border border-[#2B221B]">
        {/* Ground level */}
        <line x1="20" y1={oy} x2="440" y2={oy} stroke="#54453A" strokeWidth="2" />

        {/* Trajectory Arc */}
        <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

        {/* Apex point */}
        <circle
          cx={ox + (range / 2) * scaleX}
          cy={oy - maxHeight * scaleY}
          r="4"
          fill="#EF4444"
        />
        <text
          x={ox + (range / 2) * scaleX - 25}
          y={oy - maxHeight * scaleY - 8}
          fill="#EF4444"
          fontSize="10"
          fontFamily="monospace"
        >
          H_max: {maxHeight.toFixed(1)}m
        </text>

        {/* Launch angle arrow */}
        <line x1={ox} y1={oy} x2={ox + 35 * Math.cos(rad)} y2={oy - 35 * Math.sin(rad)} stroke="#38BDF8" strokeWidth="2" />

        {/* Range Label */}
        <text x={ox + range * scaleX - 35} y={oy + 18} fill="#F59E0B" fontSize="10" fontFamily="monospace">
          R: {range.toFixed(1)}m
        </text>
      </svg>

      <div className="flex flex-wrap gap-4 text-xs font-mono bg-[#161210] border border-[#2D231C] px-4 py-2.5 rounded">
        <div>
          Max Height (H): <span className="text-amber-400 font-bold">{maxHeight.toFixed(2)} m</span>
        </div>
        <div>
          Horizontal Range (R): <span className="text-amber-400 font-bold">{range.toFixed(2)} m</span>
        </div>
        <div>
          Flight Time (T): <span className="text-emerald-400 font-bold">{timeOfFlight.toFixed(2)} s</span>
        </div>
      </div>
    </div>
  );
}

function DcCircuitVisualiser({ voltage, resistance }: { voltage: number; resistance: number }) {
  const current = voltage / resistance;
  const power = voltage * current;

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2">
      <svg width="440" height="200" className="bg-[#0C0908] rounded border border-[#2B221B]">
        {/* Wires */}
        <rect x="60" y="40" width="320" height="120" fill="none" stroke="#EAB308" strokeWidth="2.5" />

        {/* Battery on left */}
        <rect x="45" y="85" width="30" height="30" fill="#181310" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="52" y1="92" x2="68" y2="92" stroke="#EF4444" strokeWidth="3" />
        <line x1="56" y1="108" x2="64" y2="108" stroke="#38BDF8" strokeWidth="2" />
        <text x="32" y="105" fill="#FAF7F2" fontSize="10" fontFamily="monospace">{voltage}V</text>

        {/* Resistor on right */}
        <rect x="365" y="80" width="30" height="40" fill="#181310" stroke="#A89F93" strokeWidth="2" />
        <text x="402" y="105" fill="#FAF7F2" fontSize="10" fontFamily="monospace">{resistance}Ω</text>

        {/* Ammeter top */}
        <circle cx="220" cy="40" r="14" fill="#181310" stroke="#4C9A66" strokeWidth="2" />
        <text x="215" y="44" fill="#4C9A66" fontSize="11" fontFamily="monospace" fontWeight="bold">A</text>
        <text x="200" y="24" fill="#4C9A66" fontSize="10" fontFamily="monospace">{current.toFixed(2)}A</text>

        {/* Electron dots */}
        <circle cx="140" cy="40" r="3" fill="#38BDF8" />
        <circle cx="300" cy="40" r="3" fill="#38BDF8" />
        <circle cx="380" cy="140" r="3" fill="#38BDF8" />
        <circle cx="220" cy="160" r="3" fill="#38BDF8" />
      </svg>

      <div className="flex flex-wrap gap-4 text-xs font-mono bg-[#161210] border border-[#2D231C] px-4 py-2.5 rounded">
        <div>
          Current (I = V/R): <span className="text-emerald-400 font-bold">{current.toFixed(3)} A</span>
        </div>
        <div>
          Joule Thermal Power (P = VI): <span className="text-amber-400 font-bold">{power.toFixed(2)} W</span>
        </div>
      </div>
    </div>
  );
}

function VseprVisualiser({ typeIndex }: { typeIndex: number }) {
  const geometries = [
    { name: "Linear (BeCl2)", angle: "180°", hyb: "sp", steric: 2, desc: "2 bonding pairs, 0 lone pairs. Perfect collinear alignment." },
    { name: "Trigonal Planar (BF3)", angle: "120°", hyb: "sp²", steric: 3, desc: "3 bonding pairs symmetrically disposed on a 2D plane." },
    { name: "Tetrahedral (CH4)", angle: "109.5°", hyb: "sp³", steric: 4, desc: "4 bonding pairs pointing to vertices of regular tetrahedron." },
    { name: "Trigonal Bipyramidal (PCl5)", angle: "120° (equatorial), 90° (axial)", hyb: "sp³d", steric: 5, desc: "3 equatorial bonds and 2 longer axial bonds." },
    { name: "Octahedral (SF6)", angle: "90°", hyb: "sp³d²", steric: 6, desc: "6 equivalent bonds pointing to vertices of regular octahedron." },
  ];
  const g = geometries[Math.min(Math.max(typeIndex - 1, 0), geometries.length - 1)];

  return (
    <div className="flex flex-col items-center gap-4 py-3 text-center">
      <div className="w-48 h-48 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center relative bg-[#120E0C]">
        {/* Central Atom */}
        <circle cx="96" cy="96" r="16" fill="#F59E0B" />
        <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
          A
        </div>

        {/* Orbiting Ligands */}
        {typeIndex === 1 && (
          <>
            <div className="absolute left-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute right-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
          </>
        )}
        {typeIndex === 2 && (
          <>
            <div className="absolute top-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute bottom-4 left-6 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute bottom-4 right-6 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
          </>
        )}
        {typeIndex >= 3 && (
          <>
            <div className="absolute top-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute bottom-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute left-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
            <div className="absolute right-2 w-5 h-5 rounded-full bg-emerald-500 text-black text-[9px] flex items-center justify-center font-bold">B</div>
          </>
        )}
      </div>

      <div className="space-y-1 font-mono text-xs">
        <div className="text-amber-400 font-bold text-sm">{g.name}</div>
        <div className="text-zinc-300">
          Hybridization: <span className="text-emerald-400 font-bold">{g.hyb}</span> · Bond Angle:{" "}
          <span className="text-sky-400 font-bold">{g.angle}</span>
        </div>
        <p className="text-[11px] text-zinc-400 max-w-sm">{g.desc}</p>
      </div>
    </div>
  );
}

function CellVisualiser({ cellType }: { cellType: number }) {
  const isPlant = cellType === 1;

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center max-w-md">
      <div
        className={`w-64 h-48 border-4 relative flex items-center justify-center ${
          isPlant
            ? "border-emerald-600 rounded-md bg-[#0F1E14]"
            : "border-sky-600 rounded-full bg-[#0F1722]"
        }`}
      >
        {/* Cell Wall indicator for plant */}
        {isPlant && (
          <div className="absolute inset-1 border-2 border-emerald-400/40 pointer-events-none rounded-sm" />
        )}

        {/* Nucleus */}
        <div className="w-16 h-16 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-[10px] text-purple-200 font-mono">
          Nucleus
        </div>

        {/* Organelle Callouts */}
        {isPlant ? (
          <>
            <div className="absolute top-3 left-4 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[9px] font-mono">
              Chloroplast
            </div>
            <div className="absolute bottom-3 right-4 px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500 text-[9px] font-mono">
              Central Vacuole
            </div>
            <div className="absolute top-2 right-4 text-[9px] font-mono text-emerald-400">
              Cellulose Wall
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-3 left-4 px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500 text-[9px] font-mono">
              Mitochondria
            </div>
            <div className="absolute bottom-3 right-6 px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500 text-[9px] font-mono">
              Centrioles
            </div>
          </>
        )}
      </div>

      <div className="text-xs font-mono text-zinc-300">
        Active Model:{" "}
        <span className="font-bold text-amber-400">
          {isPlant ? "Plant Cell (Eukaryote with Wall & Plastids)" : "Animal Cell (Eukaryote with Centrioles)"}
        </span>
      </div>
    </div>
  );
}

function TimelineVisualiser({ stageIndex }: { stageIndex: number }) {
  const stages = [
    { year: "1917", title: "Champaran Satyagraha", detail: "Mahatma Gandhi's first civil disobedience against oppressive indigo planter contracts in Bihar." },
    { year: "1919", title: "Rowlatt Act & Jallianwala Bagh", detail: "Protest against indefinite detention without trial; General Dyer's massacre of peaceful assembly in Amritsar." },
    { year: "1920–22", title: "Non-Cooperation Movement", detail: "Surrender of British titles, boycott of foreign cloth and schools; withdrawn after Chauri Chaura violence." },
    { year: "1930", title: "Dandi Salt March", detail: "240-mile march breaking the British salt monopoly, launching nationwide Civil Disobedience." },
    { year: "1942", title: "Quit India Movement", detail: "All-India Congress Committee launch of 'Do or Die' mass struggle demanding complete British withdrawal." },
  ];
  const s = stages[Math.min(Math.max(stageIndex, 0), stages.length - 1)];

  return (
    <div className="space-y-4 max-w-md text-center py-3">
      <div className="inline-block px-3 py-1 rounded bg-[#241B16] border border-amber-500/40 text-amber-400 font-mono font-bold text-sm">
        Year: {s.year}
      </div>
      <h4 className="text-base font-serif font-bold text-[#FAF7F2]">{s.title}</h4>
      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{s.detail}</p>
    </div>
  );
}
