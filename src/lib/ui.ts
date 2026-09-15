// ── 버튼 ──────────────────────────────────────────────
const btnBase =
  'inline-flex items-center justify-center gap-ds-2 rounded-ds border font-serif text-ui font-semibold ' +
  'px-ds-4 py-2.5 cursor-pointer no-underline transition-colors duration-100 ' +
  'disabled:opacity-45 disabled:cursor-not-allowed';

export const btnPrimary = `${btnBase} border-transparent bg-cyan text-paper hover:bg-cyan-600 active:bg-cyan-700`;
export const btnSecondary = `${btnBase} border-divider bg-transparent text-ink hover:bg-ink/[0.07] active:bg-ink/[0.12]`;
export const btnGhost = `${btnBase} border-transparent bg-transparent text-ink hover:bg-ink/[0.07]`;
export const btnIcon = `${btnBase} border-transparent p-2`;
export const btnBlock = 'w-full';

// ── 태그 ──────────────────────────────────────────────
const tagBase = 'inline-flex items-center rounded-ds-sm px-2 py-0.5 text-[11px] font-semibold';
export const tagCyan = `${tagBase} bg-cyan-100 text-cyan-800`;
export const tagMagenta = `${tagBase} bg-magenta-100 text-magenta-800`;
export const tagNeutral = `${tagBase} bg-gray-100 text-gray-800`;
export const tagOutline = `${tagBase} border border-cyan text-cyan-700`;

// ── 폼 ────────────────────────────────────────────────
export const fieldRoot = 'flex flex-col gap-ds-1';
export const fieldLabel = 'text-meta text-ink/70';
export const inputBase =
  'w-full min-h-9 rounded-ds border border-divider bg-surface px-ds-2 py-1.5 text-ui text-ink ' +
  'caret-cyan placeholder:text-ink/65 hover:border-ink/45 focus-visible:border-cyan focus-visible:ring-0';

// ── 카드 (목록 아이템 전용) ────────────────────────────
export const cardRoot = 'flex flex-col gap-ds-2 rounded-ds bg-surface p-ds-3';
export const cardKicker = 'text-meta text-gray-700';
export const cardTitle = 'font-serif text-lead font-semibold leading-tight';
export const cardBody = 'text-ui text-gray-800';
export const cardMeta = 'text-meta text-gray-700';

// ── 표 ────────────────────────────────────────────────
export const tableRoot = 'w-full border-collapse text-ui';
export const tableTh = 'border-b border-divider p-ds-2 text-left text-[11px] uppercase tracking-[0.08em] text-ink/60';
export const tableTd = 'border-b border-ink/[0.08] p-ds-2';

// ── 마이크로 라벨 ──────────────────────────────────────
export const microLabel = 'text-micro uppercase text-gray-700';

// ── 내비게이션 ─────────────────────────────────────────
export const navLink = 'font-serif text-ink no-underline hover:text-cyan aria-[current=page]:text-cyan';
