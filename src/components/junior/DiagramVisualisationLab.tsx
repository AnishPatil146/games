"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  RotateCcw,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  TrendingUp,
  Cpu,
  BarChart2,
} from "lucide-react";
import {
  DIAGRAM_SIMULATION_CATALOGUE,
  SimulationDomain,
  VisualisationType,
} from "@/lib/junior/diagram-lab-data";
import { FormulaRenderer } from "@/components/math/FormulaRenderer";

export function DiagramVisualisationLab() {
  const [selectedSimId, setSelectedSimId] = useState<string>("sim-math-unit-circle");
  const [selectedDomain, setSelectedDomain] = useState<SimulationDomain | "all">("all");
  const [selectedVisualType, setSelectedVisualType] = useState<VisualisationType | "all">("all");

  // Canvas Viewport Controls (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Animation Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Knowledge Check State per simulation
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(false);

  const activeSim =
    DIAGRAM_SIMULATION_CATALOGUE.find((s) => s.id === selectedSimId) ||
    DIAGRAM_SIMULATION_CATALOGUE[0];

  // Parameter state dictionary
  const [paramValues, setParamValues] = useState<Record<string, number>>({
    angleDeg: 45,
    coeffA: 1,
    coeffB: -2,
    coeffC: -3,
    objectDistance: 35,
    focalLength: 20,
    objectHeight: 20,
    launchVelocity: 30,
    launchAngle: 45,
    circuitVoltage: 12,
    circuitResistance: 10,
    geometryType: 3,
    cellType: 1,
    demandShift: 100,
    supplyShift: 20,
    arraySize: 7,
    stepIndex: 3,
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
    setZoomLevel(1);
    setIsPlaying(false);
    setSelectedOptionIndex(null);
    setHasSubmittedQuiz(false);
  };

  // Reset quiz state when switching simulations
  const handleSelectSim = (simId: string) => {
    setSelectedSimId(simId);
    setSelectedOptionIndex(null);
    setHasSubmittedQuiz(false);
    setIsPlaying(false);
  };

  // Animation tick effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (activeSim.id === "sim-math-unit-circle") {
        setParamValues((prev) => ({
          ...prev,
          angleDeg: (prev.angleDeg + 5) % 360,
        }));
      } else if (activeSim.id === "sim-cs-sorting") {
        setParamValues((prev) => ({
          ...prev,
          stepIndex: (prev.stepIndex + 1) % 11,
        }));
      }
    }, 300 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeSim.id]);

  const filteredSims = DIAGRAM_SIMULATION_CATALOGUE.filter((s) => {
    const matchesDomain = selectedDomain === "all" || s.domain === selectedDomain;
    const matchesType = selectedVisualType === "all" || s.visualType === selectedVisualType;
    return matchesDomain && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#181412] border border-[#2F2722] rounded-md p-5 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <Compass className="w-3 h-3" />
              VISUAL LEARNING LAB
            </span>
            <span className="text-zinc-500 text-xs">·</span>
            <span className="text-[11px] font-mono text-zinc-400">Class 10 · 11 · 12 Verified Systems</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF7F2] tracking-wide">
            Visual Learning &amp; Interactive Simulation Studio
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            Real-time interactive mathematical graphs, optical ray tracing, kinematics trajectories, circuit dynamics, molecular architectures, and algorithmic flows. Manipulate actual physical parameters to see validated theoretical behavior.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10 relative z-10">
          {/* Domain Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: "All Subjects" },
                { id: "mathematics", label: "Math" },
                { id: "physics", label: "Physics" },
                { id: "chemistry", label: "Chemistry" },
                { id: "biology", label: "Biology" },
                { id: "commerce", label: "Commerce" },
                { id: "computerscience", label: "CompSci" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDomain(d.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                  selectedDomain === d.id
                    ? "bg-[#FAF7F2] text-[#12100E] font-bold shadow-sm"
                    : "bg-[#221D1A] text-zinc-400 hover:text-zinc-200 border border-[#382F2A]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Visualisation Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedVisualType}
              onChange={(e) => setSelectedVisualType(e.target.value as VisualisationType | "all")}
              className="bg-[#221D1A] text-zinc-300 border border-[#382F2A] rounded px-2 py-1 text-xs font-mono focus:outline-none"
            >
              <option value="all">All Experiences ({DIAGRAM_SIMULATION_CATALOGUE.length})</option>
              <option value="INTERACTIVE_SIMULATION">Interactive Simulations</option>
              <option value="INTERACTIVE_DIAGRAM">Interactive Diagrams</option>
              <option value="GRAPH_EXPLORER">Graph Explorers</option>
              <option value="PROCESS_FLOW">Process Visualizations</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Simulation Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>Visual Modules ({filteredSims.length})</span>
            <span>Class 10–12</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {filteredSims.map((sim) => {
              const isSelected = sim.id === activeSim.id;
              return (
                <div
                  key={sim.id}
                  onClick={() => handleSelectSim(sim.id)}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#2A221C] border-[#8FA184] shadow-md ring-1 ring-[#8FA184]/40"
                      : "bg-[#161210] border-[#2B231D] hover:bg-[#1E1815] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="uppercase tracking-widest text-[#C8B28E] font-bold">
                      Class {sim.classLevel} · {sim.subjectName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/40 text-zinc-400 border border-white/10 uppercase">
                      {sim.visualType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#FAF7F2] line-clamp-1">
                    {sim.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                    {sim.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Simulation Stage & Parameter Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Simulation Stage Header */}
          <div className="bg-[#181412] border border-[#2F2722] rounded-md p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B231D] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  {activeSim.chapterTitle}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#FAF7F2]">
                  {activeSim.title}
                </h3>
              </div>

              {/* Viewport Zoom & Reset Controls */}
              <div className="flex items-center gap-1 bg-[#120F0D] p-1 rounded border border-[#2B231D]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-400 px-1.5">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                  className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetParams}
                  className="p-1 text-zinc-400 hover:text-amber-300 transition-colors border-l border-[#2B231D] ml-1 pl-1.5"
                  title="Reset Parameters & Scale"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="flex items-start gap-2 bg-[#120F0D] border border-amber-500/20 rounded p-2.5 text-xs text-[#DDD4C5]">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{activeSim.instructionPrompt}</span>
            </div>

            {/* Visual Canvas Stage with Dynamic Zoom Scaling */}
            <div className="w-full bg-[#0D0A08] border border-[#2C241D] rounded-md p-4 min-h-[340px] flex items-center justify-center relative overflow-hidden">
              <div
                className="transition-transform duration-200 w-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {activeSim.id === "sim-math-unit-circle" && (
                  <UnitCircleVisualiser angleDeg={paramValues.angleDeg ?? 45} />
                )}
                {activeSim.id === "sim-math-quadratic-parabola" && (
                  <QuadraticParabolaVisualiser
                    a={paramValues.coeffA ?? 1}
                    b={paramValues.coeffB ?? -2}
                    c={paramValues.coeffC ?? -3}
                  />
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
                    v0={paramValues.launchVelocity ?? 30}
                    angleDeg={paramValues.launchAngle ?? 45}
                  />
                )}
                {activeSim.id === "sim-physics-dc-circuit" && (
                  <CircuitVisualiser
                    voltage={paramValues.circuitVoltage ?? 12}
                    resistance={paramValues.circuitResistance ?? 10}
                  />
                )}
                {activeSim.id === "sim-chem-vsepr" && (
                  <VSEPRVisualiser geometryType={paramValues.geometryType ?? 3} />
                )}
                {activeSim.id === "sim-bio-cell-architecture" && (
                  <CellVisualiser cellType={paramValues.cellType ?? 1} />
                )}
                {activeSim.id === "sim-commerce-equilibrium" && (
                  <MarketEquilibriumVisualiser
                    demandShift={paramValues.demandShift ?? 100}
                    supplyShift={paramValues.supplyShift ?? 20}
                  />
                )}
                {activeSim.id === "sim-cs-sorting" && (
                  <SortingAlgorithmVisualiser
                    arraySize={paramValues.arraySize ?? 7}
                    stepIndex={paramValues.stepIndex ?? 3}
                  />
                )}
              </div>
            </div>

            {/* Animation Controls Row (for Animated/Dynamic Sims) */}
            {(activeSim.id === "sim-math-unit-circle" || activeSim.id === "sim-cs-sorting") && (
              <div className="flex items-center justify-between bg-[#120F0D] border border-[#2B231D] rounded p-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2B221B] hover:bg-[#3D3127] text-[#FAF7F2] font-bold"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isPlaying ? "Pause Motion" : "Play Motion"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeSim.id === "sim-math-unit-circle") {
                        setParamValues((p) => ({ ...p, angleDeg: (p.angleDeg - 5 + 360) % 360 }));
                      } else {
                        setParamValues((p) => ({ ...p, stepIndex: Math.max(0, p.stepIndex - 1) }));
                      }
                    }}
                    className="p-1 rounded bg-[#221B16] hover:bg-[#2F2620] text-zinc-300"
                    title="Step Backward"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSim.id === "sim-math-unit-circle") {
                        setParamValues((p) => ({ ...p, angleDeg: (p.angleDeg + 5) % 360 }));
                      } else {
                        setParamValues((p) => ({ ...p, stepIndex: (p.stepIndex + 1) % 11 }));
                      }
                    }}
                    className="p-1 rounded bg-[#221B16] hover:bg-[#2F2620] text-zinc-300"
                    title="Step Forward"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span>Speed:</span>
                  {[0.5, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-1.5 py-0.5 rounded ${
                        playbackSpeed === s ? "bg-amber-500 text-black font-bold" : "bg-[#221B16] text-zinc-400"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Physical Parameter Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Physical Parameter Tuning</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#14100E] border border-[#2B231D] rounded p-4">
                {activeSim.parameters.map((param) => {
                  const currentVal = paramValues[param.id] ?? param.defaultValue;
                  return (
                    <div key={param.id} className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">
                          {param.name}{" "}
                          <span className="text-amber-400 font-bold font-serif italic">
                            ({param.symbol})
                          </span>
                        </span>
                        <span className="text-[#FAF7F2] font-bold bg-[#221B16] px-2 py-0.5 rounded border border-[#3A2E26]">
                          {currentVal} {param.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={currentVal}
                        onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2A211B] rounded-lg"
                      />
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        {param.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Academic Principles */}
            <div className="space-y-2 pt-2 border-t border-[#2B231D]">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                Core Theoretical Invariants
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                {activeSim.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 font-sans leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Knowledge Check Mini-Quiz */}
            <div className="pt-3 border-t border-[#2B231D] space-y-3 bg-[#130F0D] p-4 rounded border border-[#2E241E]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Knowledge Check: Test Your Visual Understanding</span>
              </div>
              <p className="text-sm font-sans font-medium text-[#FAF7F2]">
                {activeSim.knowledgeCheck.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSim.knowledgeCheck.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIndex === oIdx;
                  const isCorrect = oIdx === activeSim.knowledgeCheck.correctIndex;
                  let optStyle = "bg-[#1E1815] border-[#382E27] text-zinc-300 hover:border-zinc-500";

                  if (hasSubmittedQuiz) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500";
                    } else if (isSelected && !isCorrect) {
                      optStyle = "bg-rose-950/80 border-rose-500 text-rose-300";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-amber-950/80 border-amber-500 text-amber-200 font-bold";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={hasSubmittedQuiz}
                      onClick={() => setSelectedOptionIndex(oIdx)}
                      className={`p-2.5 rounded border text-left text-xs font-sans transition-all flex items-start gap-2 ${optStyle}`}
                    >
                      <span className="font-mono text-[10px] text-zinc-400 shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!hasSubmittedQuiz ? (
                <button
                  type="button"
                  disabled={selectedOptionIndex === null}
                  onClick={() => setHasSubmittedQuiz(true)}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Verify Answer
                </button>
              ) : (
                <div
                  className={`p-3 rounded border text-xs leading-relaxed space-y-1 ${
                    selectedOptionIndex === activeSim.knowledgeCheck.correctIndex
                      ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                      : "bg-rose-950/40 border-rose-600/40 text-rose-300"
                  }`}
                >
                  <div className="font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                    {selectedOptionIndex === activeSim.knowledgeCheck.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Concept Verified · +25 XP Earned</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Incorrect Deduction</span>
                      </>
                    )}
                  </div>
                  <p className="text-zinc-300 font-sans">{activeSim.knowledgeCheck.explanation}</p>
                </div>
              )}
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

  const R = 100;
  const cx = 150;
  const cy = 150;
  const px = cx + R * cosVal;
  const py = cy - R * sinVal;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-around py-2">
      <div className="relative">
        <svg width="300" height="300" className="bg-[#0D0A09] rounded border border-[#2E241E]">
          <line x1="20" y1="150" x2="280" y2="150" stroke="#44372F" strokeWidth="1.5" />
          <line x1="150" y1="20" x2="150" y2="280" stroke="#44372F" strokeWidth="1.5" />
          <circle cx="150" cy="150" r={R} fill="none" stroke="#685446" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="150" y1="150" x2={px} y2="150" stroke="#4C9A66" strokeWidth="3" />
          <line x1={px} y1="150" x2={px} y2={py} stroke="#D97706" strokeWidth="3" />
          <line x1="150" y1="150" x2={px} y2={py} stroke="#FAF7F2" strokeWidth="2.5" />
          <circle cx={px} cy={py} r="5" fill="#F59E0B" />
          <text x="155" y="145" fill="#A89F93" fontSize="10" fontFamily="monospace">O</text>
          <text x={px + 8} y={py - 8} fill="#FAF7F2" fontSize="11" fontFamily="monospace">
            P({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
          </text>
        </svg>
      </div>

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

function QuadraticParabolaVisualiser({ a, b, c }: { a: number; b: number; c: number }) {
  const discriminant = b * b - 4 * a * c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = a !== 0 ? c - (b * b) / (4 * a) : c;

  // Build points for SVG path: x from -5 to +5
  const width = 360;
  const height = 260;
  const originX = width / 2;
  const originY = height / 2 + 30;
  const scaleX = 25;
  const scaleY = 12;

  const points: string[] = [];
  for (let xVal = -6; xVal <= 6; xVal += 0.25) {
    const yVal = a * xVal * xVal + b * xVal + c;
    const canvasX = originX + xVal * scaleX;
    const canvasY = originY - yVal * scaleY;
    points.push(`${canvasX},${canvasY}`);
  }
  const pathD = `M ${points.join(" L ")}`;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-around py-2">
      <svg width={width} height={height} className="bg-[#0D0A09] rounded border border-[#2E241E] overflow-hidden">
        {/* Axes */}
        <line x1="20" y1={originY} x2={width - 20} y2={originY} stroke="#44372F" strokeWidth="1.5" />
        <line x1={originX} y1="20" x2={originX} y2={height - 20} stroke="#44372F" strokeWidth="1.5" />

        {/* Parabola Curve */}
        <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

        {/* Vertex Point */}
        <circle cx={originX + vertexX * scaleX} cy={originY - vertexY * scaleY} r="4.5" fill="#10B981" />
        <text
          x={originX + vertexX * scaleX + 8}
          y={originY - vertexY * scaleY - 6}
          fill="#10B981"
          fontSize="10"
          fontFamily="monospace"
        >
          Vertex ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})
        </text>
      </svg>

      <div className="bg-[#17120F] border border-[#302620] rounded p-4 space-y-2 text-xs font-mono min-w-[220px]">
        <div className="text-zinc-400 border-b border-[#2B221B] pb-1 uppercase tracking-wider text-[10px]">
          Parabola Analysis: {a}x² + ({b})x + ({c})
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Discriminant (Δ):</span>
          <span className={`font-bold ${discriminant >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {discriminant.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Real Root Count:</span>
          <span className="font-bold text-[#FAF7F2]">
            {discriminant > 0 ? "2 Distinct Roots" : discriminant === 0 ? "1 Tangent Root" : "0 Real Roots"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Curvature:</span>
          <span className="font-bold text-amber-400">{a > 0 ? "Opens Upward (U)" : "Opens Downward (∩)"}</span>
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
  const u = -objectDistance;
  const f = focalLength;
  const v = Math.abs(u + f) > 0.01 ? (f * u) / (u + f) : 9999;
  const m = v !== 9999 ? -v / u : 1;
  const imgHeight = objectHeight * m;

  const lensX = 260;
  const axisY = 130;
  const objX = lensX + u * 3;
  const imgX = lensX + v * 3;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg width="520" height="260" className="bg-[#0C0908] rounded border border-[#2B221B] overflow-visible">
        <line x1="20" y1={axisY} x2="500" y2={axisY} stroke="#3E342B" strokeWidth="1.5" />
        <ellipse cx={lensX} cy={axisY} rx="7" ry="105" fill="#3B82F6" fillOpacity="0.2" stroke="#60A5FA" strokeWidth="2" />
        <line x1={lensX - f * 3} y1={axisY - 5} x2={lensX - f * 3} y2={axisY + 5} stroke="#A89F93" strokeWidth="2" />
        <text x={lensX - f * 3 - 6} y={axisY + 18} fill="#A89F93" fontSize="10" fontFamily="monospace">F1</text>
        <line x1={lensX + f * 3} y1={axisY - 5} x2={lensX + f * 3} y2={axisY + 5} stroke="#A89F93" strokeWidth="2" />
        <text x={lensX + f * 3 - 6} y={axisY + 18} fill="#A89F93" fontSize="10" fontFamily="monospace">F2</text>

        {/* Object Arrow */}
        <line x1={objX} y1={axisY} x2={objX} y2={axisY - objectHeight * 2} stroke="#10B981" strokeWidth="3" />
        <polygon points={`${objX},${axisY - objectHeight * 2 - 6} ${objX - 4},${axisY - objectHeight * 2} ${objX + 4},${axisY - objectHeight * 2}`} fill="#10B981" />

        {/* Image Arrow */}
        {v > 0 && v < 90 && (
          <>
            <line x1={imgX} y1={axisY} x2={imgX} y2={axisY + imgHeight * 2} stroke="#F59E0B" strokeWidth="3" />
            <polygon points={`${imgX},${axisY + imgHeight * 2 + 6} ${imgX - 4},${axisY + imgHeight * 2} ${imgX + 4},${axisY + imgHeight * 2}`} fill="#F59E0B" />
          </>
        )}
      </svg>
      <div className="text-xs font-mono text-zinc-400 flex gap-6">
        <span>Image Distance (v): <strong className="text-amber-400">{v.toFixed(1)} cm</strong></span>
        <span>Magnification (m): <strong className="text-emerald-400">{m.toFixed(2)}x</strong></span>
        <span>Orientation: <strong className="text-[#FAF7F2]">{m < 0 ? "Real & Inverted" : "Virtual & Upright"}</strong></span>
      </div>
    </div>
  );
}

function ProjectileVisualiser({ v0, angleDeg }: { v0: number; angleDeg: number }) {
  const g = 9.8;
  const rad = (angleDeg * Math.PI) / 180;
  const T = (2 * v0 * Math.sin(rad)) / g;
  const H = (v0 * v0 * Math.sin(rad) * Math.sin(rad)) / (2 * g);
  const R = (v0 * v0 * Math.sin(2 * rad)) / g;

  const points: string[] = [];
  for (let step = 0; step <= 30; step++) {
    const t = (step / 30) * T;
    const x = v0 * Math.cos(rad) * t;
    const y = v0 * Math.sin(rad) * t - 0.5 * g * t * t;
    const canvasX = 40 + (x / R) * 380;
    const canvasY = 180 - (y / Math.max(H, 1)) * 130;
    points.push(`${canvasX},${canvasY}`);
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg width="460" height="210" className="bg-[#0C0908] rounded border border-[#2B221B]">
        <line x1="30" y1="180" x2="430" y2="180" stroke="#3E342B" strokeWidth="2" />
        <path d={`M ${points.join(" L ")}`} fill="none" stroke="#F59E0B" strokeWidth="2.5" />
      </svg>
      <div className="text-xs font-mono text-zinc-400 flex gap-6">
        <span>Range (R): <strong className="text-amber-400">{R.toFixed(1)} m</strong></span>
        <span>Max Height (H): <strong className="text-emerald-400">{H.toFixed(1)} m</strong></span>
        <span>Flight Time (T): <strong className="text-[#FAF7F2]">{T.toFixed(2)} s</strong></span>
      </div>
    </div>
  );
}

function CircuitVisualiser({ voltage, resistance }: { voltage: number; resistance: number }) {
  const current = voltage / resistance;
  const power = voltage * current;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg width="440" height="200" className="bg-[#0C0908] rounded border border-[#2B221B]">
        <rect x="50" y="40" width="340" height="120" fill="none" stroke="#545E4E" strokeWidth="3" rx="8" />
        <line x1="200" y1="28" x2="200" y2="52" stroke="#10B981" strokeWidth="4" />
        <line x1="212" y1="34" x2="212" y2="46" stroke="#10B981" strokeWidth="2.5" />
        <rect x="180" y="148" width="60" height="24" fill="#241B16" stroke="#D97706" strokeWidth="2" rx="4" />
        <text x="195" y="164" fill="#F59E0B" fontSize="11" fontFamily="monospace">R={resistance}Ω</text>
      </svg>
      <div className="text-xs font-mono text-zinc-400 flex gap-6">
        <span>Current (I): <strong className="text-emerald-400">{current.toFixed(2)} A</strong></span>
        <span>Voltage (V): <strong className="text-sky-400">{voltage} V</strong></span>
        <span>Dissipated Power (P): <strong className="text-amber-400">{power.toFixed(1)} W</strong></span>
      </div>
    </div>
  );
}

function VSEPRVisualiser({ geometryType }: { geometryType: number }) {
  const types = [
    { name: "Linear (BeCl2)", angle: "180°", hybrid: "sp", count: 2 },
    { name: "Trigonal Planar (BF3)", angle: "120°", hybrid: "sp²", count: 3 },
    { name: "Tetrahedral (CH4)", angle: "109.5°", hybrid: "sp³", count: 4 },
    { name: "Trigonal Bipyramidal (PCl5)", angle: "90° & 120°", hybrid: "sp³d", count: 5 },
    { name: "Octahedral (SF6)", angle: "90°", hybrid: "sp³d²", count: 6 },
  ];
  const g = types[Math.min(Math.max(geometryType - 1, 0), types.length - 1)];

  return (
    <div className="space-y-3 text-center py-4">
      <div className="text-base font-serif font-bold text-amber-400">{g.name}</div>
      <div className="text-xs font-mono text-zinc-300">
        Bond Angle: <strong className="text-emerald-400">{g.angle}</strong> · Hybridization:{" "}
        <strong className="text-sky-400">{g.hybrid}</strong>
      </div>
    </div>
  );
}

function CellVisualiser({ cellType }: { cellType: number }) {
  const isPlant = cellType === 1;
  return (
    <div className="p-4 text-center space-y-2 text-xs font-mono">
      <div className="font-serif text-base font-bold text-emerald-400">
        {isPlant ? "Plant Cell Ultrastructure" : "Animal Cell Ultrastructure"}
      </div>
      <p className="text-zinc-400 max-w-sm mx-auto">
        {isPlant
          ? "Features rigid cellulose wall, chlorophyll plastids, and large central vacuole."
          : "Features flexible membrane, centrioles for mitotic spindle, and lysosomes."}
      </p>
    </div>
  );
}

function MarketEquilibriumVisualiser({ demandShift, supplyShift }: { demandShift: number; supplyShift: number }) {
  const P_star = (demandShift - supplyShift) / 10;
  const Q_star = supplyShift + 5 * P_star;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-around py-2">
      <svg width="340" height="240" className="bg-[#0D0A09] rounded border border-[#2E241E]">
        <line x1="40" y1="20" x2="40" y2="200" stroke="#44372F" strokeWidth="1.5" />
        <line x1="40" y1="200" x2="310" y2="200" stroke="#44372F" strokeWidth="1.5" />
        {/* Demand Line */}
        <line x1="50" y1="40" x2="280" y2="190" stroke="#F43F5E" strokeWidth="2.5" />
        {/* Supply Line */}
        <line x1="50" y1="180" x2="280" y2="50" stroke="#10B981" strokeWidth="2.5" />
      </svg>
      <div className="bg-[#17120F] border border-[#302620] rounded p-4 space-y-2 text-xs font-mono min-w-[200px]">
        <div className="text-zinc-400 border-b border-[#2B221B] pb-1 uppercase tracking-wider text-[10px]">
          Equilibrium Clearing
        </div>
        <div className="flex justify-between">
          <span className="text-rose-400">Price (P*):</span>
          <span className="font-bold text-[#FAF7F2]">${Math.max(1, P_star).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-emerald-400">Quantity (Q*):</span>
          <span className="font-bold text-[#FAF7F2]">{Math.max(10, Q_star).toFixed(0)} units</span>
        </div>
      </div>
    </div>
  );
}

function SortingAlgorithmVisualiser({ arraySize, stepIndex }: { arraySize: number; stepIndex: number }) {
  const numbers = [32, 14, 68, 45, 82, 19, 53, 76, 27, 91, 12, 60].slice(0, arraySize);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-end gap-2 h-40 bg-[#0C0908] p-4 rounded border border-[#2B221B]">
        {numbers.map((val, idx) => {
          const isComparing = idx === stepIndex % arraySize || idx === (stepIndex + 1) % arraySize;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-zinc-400">{val}</span>
              <div
                className={`w-8 rounded-t transition-all ${
                  isComparing ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-emerald-600"
                }`}
                style={{ height: `${val * 1.3}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="text-xs font-mono text-zinc-400">
        Active Pass Step: <strong className="text-amber-400">{stepIndex}</strong> · Comparing adjacent bars
      </div>
    </div>
  );
}
