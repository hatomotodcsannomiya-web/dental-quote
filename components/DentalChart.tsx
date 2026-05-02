"use client";

import { getTeethByMode, type Tooth, type ToothType } from "@/lib/teeth";

interface Props {
  mode: ToothType;
  selectedTeeth: Set<string>;
  onToggle: (toothId: string) => void;
}

function ToothButton({ tooth, selected, onClick }: { tooth: Tooth; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooth.label}
      className={`
        w-9 h-9 text-xs font-medium border-2 rounded transition-all
        ${selected
          ? "bg-blue-500 border-blue-600 text-white shadow-md"
          : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
        }
      `}
    >
      {tooth.number}
    </button>
  );
}

function QuadrantRow({
  label,
  teeth,
  selectedTeeth,
  onToggle,
  reverse,
}: {
  label: string;
  teeth: Tooth[];
  selectedTeeth: Set<string>;
  onToggle: (id: string) => void;
  reverse?: boolean;
}) {
  const sorted = [...teeth].sort((a, b) =>
    reverse ? b.position - a.position : a.position - b.position
  );
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 w-8 shrink-0 text-right">{label}</span>
      <div className="flex gap-1">
        {sorted.map((tooth) => (
          <ToothButton
            key={tooth.id}
            tooth={tooth}
            selected={selectedTeeth.has(tooth.id)}
            onClick={() => onToggle(tooth.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function DentalChart({ mode, selectedTeeth, onToggle }: Props) {
  const teeth = getTeethByMode(mode);
  const upperRight = teeth.filter((t) => t.row === "upper" && t.side === "right");
  const upperLeft = teeth.filter((t) => t.row === "upper" && t.side === "left");
  const lowerRight = teeth.filter((t) => t.row === "lower" && t.side === "right");
  const lowerLeft = teeth.filter((t) => t.row === "lower" && t.side === "left");

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 inline-block">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs text-gray-400 mr-8">右</span>
        <span className="text-sm font-semibold text-gray-600 w-32 text-center">上顎</span>
        <span className="text-xs text-gray-400 ml-8">左</span>
      </div>

      <div className="flex gap-2 items-center justify-center mb-1">
        <QuadrantRow label="右上" teeth={upperRight} selectedTeeth={selectedTeeth} onToggle={onToggle} reverse />
        <div className="w-px h-8 bg-gray-300" />
        <QuadrantRow label="左上" teeth={upperLeft} selectedTeeth={selectedTeeth} onToggle={onToggle} />
      </div>

      <div className="h-px bg-gray-300 my-2" />

      <div className="flex gap-2 items-center justify-center mt-1">
        <QuadrantRow label="右下" teeth={lowerRight} selectedTeeth={selectedTeeth} onToggle={onToggle} reverse />
        <div className="w-px h-8 bg-gray-300" />
        <QuadrantRow label="左下" teeth={lowerLeft} selectedTeeth={selectedTeeth} onToggle={onToggle} />
      </div>

      <div className="flex items-center justify-center mt-2">
        <span className="text-sm font-semibold text-gray-600 w-32 text-center">下顎</span>
      </div>
    </div>
  );
}
