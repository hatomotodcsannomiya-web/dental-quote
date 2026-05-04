"use client";

import { ALL_TEETH, type Tooth } from "@/lib/teeth";

interface Props {
  selectedTeeth: Set<string>;
  onToggle: (toothId: string) => void;
}

const TOOTH_W = "w-11 h-11";

function ToothButton({ tooth, selected, onClick }: { tooth: Tooth; selected: boolean; onClick: () => void }) {
  const isDeciduous = tooth.type === "deciduous";
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooth.label}
      className={`
        ${TOOTH_W} text-sm font-medium border-2 rounded transition-all shrink-0
        ${isDeciduous ? "rounded-full" : ""}
        ${selected
          ? "bg-blue-500 border-blue-600 text-white shadow-md"
          : isDeciduous
            ? "bg-amber-50 border-amber-300 text-amber-700 hover:border-amber-500 hover:bg-amber-100"
            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
        }
      `}
    >
      {tooth.number}
    </button>
  );
}

// 永久歯8本分の幅に合わせるための空白セル（乳歯は5本なので3本分のスペース）
function Spacer({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${TOOTH_W} shrink-0`} />
      ))}
    </>
  );
}

function HalfRow({
  permanent,
  deciduous,
  reverse,
  showDeciduous,
}: {
  permanent: Tooth[];
  deciduous: Tooth[];
  reverse: boolean;
  showDeciduous: boolean;
}) {
  const sortedP = [...permanent].sort((a, b) => reverse ? b.position - a.position : a.position - b.position);
  const sortedD = [...deciduous].sort((a, b) => reverse ? b.position - a.position : a.position - b.position);

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex gap-1">
        {sortedP.map((t) => <ToothButton key={t.id} tooth={t} selected={false} onClick={() => {}} />)}
      </div>
      {showDeciduous && (
        <div className="flex gap-1">
          {reverse ? <Spacer count={3} /> : null}
          {sortedD.map((t) => <ToothButton key={t.id} tooth={t} selected={false} onClick={() => {}} />)}
          {!reverse ? <Spacer count={3} /> : null}
        </div>
      )}
    </div>
  );
}

export default function DentalChart({ selectedTeeth, onToggle }: Props) {
  const pUR = ALL_TEETH.filter((t) => t.type === "permanent" && t.row === "upper" && t.side === "right");
  const pUL = ALL_TEETH.filter((t) => t.type === "permanent" && t.row === "upper" && t.side === "left");
  const pLR = ALL_TEETH.filter((t) => t.type === "permanent" && t.row === "lower" && t.side === "right");
  const pLL = ALL_TEETH.filter((t) => t.type === "permanent" && t.row === "lower" && t.side === "left");
  const dUR = ALL_TEETH.filter((t) => t.type === "deciduous" && t.row === "upper" && t.side === "right");
  const dUL = ALL_TEETH.filter((t) => t.type === "deciduous" && t.row === "upper" && t.side === "left");
  const dLR = ALL_TEETH.filter((t) => t.type === "deciduous" && t.row === "lower" && t.side === "right");
  const dLL = ALL_TEETH.filter((t) => t.type === "deciduous" && t.row === "lower" && t.side === "left");

  function renderHalf(
    perm: Tooth[],
    deci: Tooth[],
    reverse: boolean,
    deciduousFirst: boolean
  ) {
    const sortedP = [...perm].sort((a, b) => reverse ? b.position - a.position : a.position - b.position);
    const sortedD = [...deci].sort((a, b) => reverse ? b.position - a.position : a.position - b.position);

    const permRow = (
      <div className="flex gap-1">
        {sortedP.map((t) => (
          <ToothButton key={t.id} tooth={t} selected={selectedTeeth.has(t.id)} onClick={() => onToggle(t.id)} />
        ))}
      </div>
    );
    const deciRow = (
      <div className="flex gap-1">
        {reverse ? <Spacer count={3} /> : null}
        {sortedD.map((t) => (
          <ToothButton key={t.id} tooth={t} selected={selectedTeeth.has(t.id)} onClick={() => onToggle(t.id)} />
        ))}
        {!reverse ? <Spacer count={3} /> : null}
      </div>
    );

    return (
      <div className="flex flex-col gap-1">
        {deciduousFirst ? deciRow : permRow}
        {deciduousFirst ? permRow : deciRow}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 inline-block select-none">
      {/* 凡例 */}
      <div className="flex gap-4 justify-center mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 inline-block border-2 border-gray-300 bg-white rounded" />
          永久歯
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 inline-block border-2 border-amber-300 bg-amber-50 rounded-full" />
          乳歯
        </span>
      </div>

      <div className="flex items-center justify-center mb-1 text-xs text-gray-400 gap-2">
        <span className="w-16 text-right">右</span>
        <span className="font-semibold text-gray-600 w-8 text-center">上顎</span>
        <span className="w-16 text-left">左</span>
      </div>

      {/* 上顎：永久歯→乳歯 */}
      <div className="flex gap-1 items-start justify-center mb-1">
        {renderHalf(pUR, dUR, true, false)}
        <div className="w-px self-stretch bg-gray-300 mx-1" />
        {renderHalf(pUL, dUL, false, false)}
      </div>

      <div className="h-px bg-gray-300 my-2" />

      {/* 下顎：乳歯→永久歯 */}
      <div className="flex gap-1 items-start justify-center mt-1">
        {renderHalf(pLR, dLR, true, true)}
        <div className="w-px self-stretch bg-gray-300 mx-1" />
        {renderHalf(pLL, dLL, false, true)}
      </div>

      <div className="flex items-center justify-center mt-1 text-xs text-gray-400 gap-2">
        <span className="w-16 text-right">右</span>
        <span className="font-semibold text-gray-600 w-8 text-center">下顎</span>
        <span className="w-16 text-left">左</span>
      </div>
    </div>
  );
}
