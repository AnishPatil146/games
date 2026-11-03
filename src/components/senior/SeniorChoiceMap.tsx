"use client";

export interface ChoiceMapStep {
  chapter: number;
  title: string;
  selectedLabel: string | null;
  alternatives: string[];
  completed: boolean;
}

interface SeniorChoiceMapProps {
  steps: ChoiceMapStep[];
  seventhDoor?: {
    unlocked: boolean;
    completed: boolean;
    choiceLabel: string | null;
  };
  tone?: "light" | "dark";
}

export function SeniorChoiceMap({
  steps,
  seventhDoor,
  tone = "light",
}: SeniorChoiceMapProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`rounded-sm border p-5 sm:p-7 space-y-6 ${
        isDark
          ? "bg-[#161412] border-[#2C2723] text-[#FAF7F2]"
          : "bg-[#FAF7F2] border-[#DDD4C5] text-[#1C1917]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b pb-3 border-current/10">
        <div>
          <p
            className={`text-[10px] uppercase tracking-[0.24em] ${
              isDark ? "text-[#A89F93]" : "text-[#8A8178]"
            }`}
          >
            Branching Narrative Cartography
          </p>
          <h3 className="font-serif text-xl mt-0.5">Session Choice Map</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#545E4E]" />
            Chosen Path
          </span>
          <span
            className={`inline-flex items-center gap-1.5 ${
              isDark ? "text-[#8A8178]" : "text-[#8A8178]"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full border border-[#8A8178]" />
            Unwalked Branch
          </span>
        </div>
      </div>

      {/* Visual SVG Constellation Spine */}
      <div className="w-full overflow-x-auto pb-2">
        <svg
          viewBox="0 0 780 128"
          className="w-full min-w-[620px] h-auto"
          role="img"
          aria-label="Visual map of selected choices across chapters one through seven"
        >
          {/* Baseline spine */}
          <line
            x1="48"
            y1="64"
            x2={seventhDoor?.unlocked ? "732" : "620"}
            y2="64"
            stroke={isDark ? "#3A342E" : "#DDD4C5"}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {steps.map((step, idx) => {
            const cx = 56 + idx * 112;
            const cy = 64;
            return (
              <g key={step.chapter}>
                {/* Upper & lower unchosen ghost branches */}
                <path
                  d={`M ${cx} ${cy} Q ${cx + 26} ${cy - 28}, ${cx + 52} ${cy - 28}`}
                  fill="none"
                  stroke={isDark ? "#2E2924" : "#E5DEC9"}
                  strokeWidth="1"
                />
                <circle
                  cx={cx + 52}
                  cy={cy - 28}
                  r="3"
                  fill="none"
                  stroke={isDark ? "#57524C" : "#C5BBA8"}
                />
                <path
                  d={`M ${cx} ${cy} Q ${cx + 26} ${cy + 28}, ${cx + 52} ${cy + 28}`}
                  fill="none"
                  stroke={isDark ? "#2E2924" : "#E5DEC9"}
                  strokeWidth="1"
                />
                <circle
                  cx={cx + 52}
                  cy={cy + 28}
                  r="3"
                  fill="none"
                  stroke={isDark ? "#57524C" : "#C5BBA8"}
                />

                {/* Active connecting segment to next completed chapter */}
                {idx < steps.length - 1 && step.completed && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx + 112}
                    y2={cy}
                    stroke="#545E4E"
                    strokeWidth="2.2"
                  />
                )}

                {/* Chapter Node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="11"
                  fill={
                    step.completed
                      ? "#545E4E"
                      : isDark
                      ? "#1E1B18"
                      : "#F3EDE2"
                  }
                  stroke={step.completed ? "#545E4E" : "#8A8178"}
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fill={
                    step.completed
                      ? "#FAF7F2"
                      : isDark
                      ? "#A89F93"
                      : "#57524C"
                  }
                >
                  0{step.chapter}
                </text>

                <text
                  x={cx}
                  y={106}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isDark ? "#D6CEC0" : "#57524C"}
                >
                  {step.selectedLabel
                    ? step.selectedLabel.slice(0, 16)
                    : "Pending"}
                </text>
              </g>
            );
          })}

          {/* Seventh Door Node */}
          <g>
            {seventhDoor?.unlocked && (
              <line
                x1={56 + 5 * 112}
                y1={64}
                x2={724}
                y2={64}
                stroke={seventhDoor.completed ? "#9E6B68" : "#8A8178"}
                strokeWidth="1.8"
                strokeDasharray={seventhDoor.completed ? undefined : "4 3"}
              />
            )}
            <rect
              x={713}
              y={53}
              width={22}
              height={22}
              rx={2}
              fill={
                seventhDoor?.completed
                  ? "#9E6B68"
                  : seventhDoor?.unlocked
                  ? isDark
                    ? "#2B2420"
                    : "#F3EDE2"
                  : "transparent"
              }
              stroke={
                seventhDoor?.completed
                  ? "#9E6B68"
                  : seventhDoor?.unlocked
                  ? "#C8B28E"
                  : isDark
                  ? "#3A342E"
                  : "#DDD4C5"
              }
              strokeWidth="1.5"
            />
            <text
              x={724}
              y={67.5}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fill={
                seventhDoor?.completed
                  ? "#FAF7F2"
                  : isDark
                  ? "#A89F93"
                  : "#57524C"
              }
            >
              VII
            </text>
            <text
              x={724}
              y={106}
              textAnchor="middle"
              fontSize="9"
              fill={isDark ? "#C8B28E" : "#8A8178"}
            >
              {seventhDoor?.completed
                ? "7th Door Sealed"
                : seventhDoor?.unlocked
                ? "7th Door Open"
                : "Locked"}
            </text>
          </g>
        </svg>
      </div>

      {/* Structured Chapter-by-Chapter Branch Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => (
          <div
            key={step.chapter}
            className={`p-3.5 rounded-sm border text-xs space-y-1.5 ${
              isDark
                ? "bg-[#1E1B18] border-[#2E2924]"
                : "bg-[#F3EDE2]/60 border-[#DDD4C5]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                Ch. 0{step.chapter}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.16em] ${
                  step.completed ? "text-[#545E4E]" : "text-[#8A8178]"
                }`}
              >
                {step.completed ? "Recorded" : "Unvisited"}
              </span>
            </div>
            <p className="font-serif text-sm">{step.title}</p>
            <p
              className={`font-medium ${
                isDark ? "text-[#FAF7F2]" : "text-[#1C1917]"
              }`}
            >
              {step.selectedLabel || "No decision logged"}
            </p>
            {step.alternatives.length > 0 && (
              <p className="text-[11px] text-[#8A8178] leading-snug">
                Unchosen: {step.alternatives.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

