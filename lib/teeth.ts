export type ToothType = "permanent" | "deciduous";

export interface Tooth {
  id: string;
  label: string;
  quadrant: "右上" | "左上" | "右下" | "左下";
  number: string;
  type: ToothType;
  row: "upper" | "lower";
  side: "right" | "left";
  position: number;
}

function buildTeeth(): Tooth[] {
  const teeth: Tooth[] = [];
  const quadrants: Array<{ q: Tooth["quadrant"]; row: Tooth["row"]; side: Tooth["side"] }> = [
    { q: "右上", row: "upper", side: "right" },
    { q: "左上", row: "upper", side: "left" },
    { q: "右下", row: "lower", side: "right" },
    { q: "左下", row: "lower", side: "left" },
  ];

  for (const { q, row, side } of quadrants) {
    for (let i = 1; i <= 8; i++) {
      teeth.push({
        id: `${q}${i}`,
        label: `${q}${i}番`,
        quadrant: q,
        number: String(i),
        type: "permanent",
        row,
        side,
        position: i,
      });
    }
    for (const letter of ["A", "B", "C", "D", "E"]) {
      teeth.push({
        id: `${q}${letter}`,
        label: `${q}${letter}`,
        quadrant: q,
        number: letter,
        type: "deciduous",
        row,
        side,
        position: ["A", "B", "C", "D", "E"].indexOf(letter) + 1,
      });
    }
  }

  return teeth;
}

export const ALL_TEETH = buildTeeth();

export function getTeethByMode(mode: ToothType): Tooth[] {
  return ALL_TEETH.filter((t) => t.type === mode);
}

export function getToothById(id: string): Tooth | undefined {
  return ALL_TEETH.find((t) => t.id === id);
}
