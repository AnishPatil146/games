"use client";

interface DiagramProps {
  type?:
    | "vector_plane"
    | "circuit_ohm"
    | "optics_refraction"
    | "demand_supply"
    | "accounting_ledger"
    | "earth_layers";
}

export function JuniorInteractiveDiagram({ type }: DiagramProps) {
  if (!type) return null;

  return (
    <figure className="my-4 p-4 bg-[#F3EDE2]/80 border border-[#DDD4C5] rounded-sm">
      {type === "vector_plane" && (
        <svg
          viewBox="0 0 360 150"
          className="w-full max-w-md mx-auto h-36"
          role="img"
          aria-label="Two orthogonal vectors on a Cartesian coordinate plane with resultant R"
        >
          <line x1="40" y1="125" x2="320" y2="125" stroke="#8A8178" strokeWidth="1.2" />
          <line x1="40" y1="125" x2="40" y2="20" stroke="#8A8178" strokeWidth="1.2" />
          <line x1="40" y1="125" x2="210" y2="125" stroke="#1C1917" strokeWidth="2" />
          <line x1="40" y1="125" x2="40" y2="45" stroke="#545E4E" strokeWidth="2" />
          <line
            x1="40"
            y1="125"
            x2="210"
            y2="45"
            stroke="#9E6B68"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text x="125" y="140" fontSize="10" fill="#1C1917" fontFamily="monospace">
            Ax
          </text>
          <text x="20" y="82" fontSize="10" fill="#545E4E" fontFamily="monospace">
            Ay
          </text>
          <text x="132" y="75" fontSize="10" fill="#9E6B68" fontFamily="monospace">
            R = √(Ax² + Ay²)
          </text>
        </svg>
      )}

      {type === "circuit_ohm" && (
        <svg
          viewBox="0 0 360 140"
          className="w-full max-w-md mx-auto h-32"
          role="img"
          aria-label="Closed DC circuit schematic illustrating voltage source V and resistor network"
        >
          <rect
            x="60"
            y="28"
            width="240"
            height="84"
            fill="none"
            stroke="#1C1917"
            strokeWidth="1.5"
          />
          <rect x="145" y="20" width="70" height="16" fill="#FAF7F2" stroke="#545E4E" strokeWidth="1.5" />
          <text x="180" y="32" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#1C1917">
            R (Ω)
          </text>
          <circle cx="180" cy="112" r="12" fill="#FAF7F2" stroke="#9E6B68" strokeWidth="1.5" />
          <text x="180" y="116" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#9E6B68">
            V
          </text>
        </svg>
      )}

      {type === "optics_refraction" && (
        <svg
          viewBox="0 0 360 150"
          className="w-full max-w-md mx-auto h-36"
          role="img"
          aria-label="Incident and refracted ray crossing media boundary n1 to n2"
        >
          <line x1="30" y1="75" x2="330" y2="75" stroke="#1C1917" strokeWidth="1.4" />
          <line
            x1="180"
            y1="15"
            x2="180"
            y2="135"
            stroke="#8A8178"
            strokeDasharray="3 3"
            strokeWidth="1.2"
          />
          <line x1="95" y1="22" x2="180" y2="75" stroke="#545E4E" strokeWidth="2" />
          <line x1="180" y1="75" x2="232" y2="132" stroke="#9E6B68" strokeWidth="2" />
          <text x="48" y="64" fontSize="10" fontFamily="monospace" fill="#57524C">
            Medium n₁
          </text>
          <text x="48" y="94" fontSize="10" fontFamily="monospace" fill="#57524C">
            Medium n₂
          </text>
        </svg>
      )}

      {type === "demand_supply" && (
        <svg
          viewBox="0 0 360 150"
          className="w-full max-w-md mx-auto h-36"
          role="img"
          aria-label="Price and Quantity axes showing intersecting Demand and Supply curves"
        >
          <line x1="55" y1="125" x2="310" y2="125" stroke="#1C1917" strokeWidth="1.4" />
          <line x1="55" y1="125" x2="55" y2="20" stroke="#1C1917" strokeWidth="1.4" />
          <line x1="80" y1="32" x2="280" y2="112" stroke="#9E6B68" strokeWidth="2" />
          <line x1="80" y1="112" x2="280" y2="32" stroke="#545E4E" strokeWidth="2" />
          <circle cx="180" cy="72" r="4" fill="#1C1917" />
          <text x="285" y="36" fontSize="10" fontFamily="monospace" fill="#545E4E">
            S
          </text>
          <text x="285" y="115" fontSize="10" fontFamily="monospace" fill="#9E6B68">
            D
          </text>
          <text x="188" y="68" fontSize="9.5" fontFamily="monospace" fill="#1C1917">
            E (P*, Q*)
          </text>
        </svg>
      )}

      {type === "accounting_ledger" && (
        <svg
          viewBox="0 0 360 120"
          className="w-full max-w-md mx-auto h-28"
          role="img"
          aria-label="Double-entry T-account showing Debit on left and Credit on right"
        >
          <line x1="40" y1="34" x2="320" y2="34" stroke="#1C1917" strokeWidth="1.8" />
          <line x1="180" y1="34" x2="180" y2="108" stroke="#1C1917" strokeWidth="1.6" />
          <text x="50" y="24" fontSize="10" fontFamily="monospace" fill="#545E4E">
            Dr. (Debit)
          </text>
          <text x="310" y="24" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#9E6B68">
            Cr. (Credit)
          </text>
          <text x="180" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1C1917">
            LEDGER ACCOUNT
          </text>
        </svg>
      )}

      {type === "earth_layers" && (
        <svg
          viewBox="0 0 360 140"
          className="w-full max-w-md mx-auto h-32"
          role="img"
          aria-label="Concentric cross-section of Earth interior: Crust, Mantle, and Core"
        >
          <circle cx="180" cy="70" r="56" fill="#E7E0D3" stroke="#1C1917" strokeWidth="1.4" />
          <circle cx="180" cy="70" r="38" fill="#D6CEC0" stroke="#545E4E" strokeWidth="1.2" />
          <circle cx="180" cy="70" r="18" fill="#9E6B68" fillOpacity="0.35" stroke="#9E6B68" strokeWidth="1.2" />
          <text x="248" y="34" fontSize="9.5" fontFamily="monospace" fill="#1C1917">
            Crust / Mantle / Core
          </text>
        </svg>
      )}
    </figure>
  );
}

