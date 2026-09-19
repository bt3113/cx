/** Tiny class-name joiner. A dependency would not earn its bytes here. */
export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...parts: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) v.forEach(walk);
    else out.push(String(v));
  };
  parts.forEach(walk);
  return out.join(' ');
}
