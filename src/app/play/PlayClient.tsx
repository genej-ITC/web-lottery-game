'use client';

import { useEffect, useState } from 'react';
import { NumberGrid } from '@/components/NumberGrid';
import { purchaseAction, type PurchaseActionResult } from './actions';
import { RANK_LABEL } from '@/lib/rank';
import { btnPrimary, btnSecondary, microLabel } from '@/lib/ui';

const RANGES: [number, number][] = [
  [1, 9],
  [10, 18],
  [19, 27],
  [28, 36],
  [37, 45],
];

export function PlayClient({ initialPoints }: { initialPoints: number }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseActionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState(initialPoints);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!result?.ok || revealed >= 7) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 380);
    return () => clearTimeout(t);
  }, [result, revealed]);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : prev.length < 6 ? [...prev, n] : prev
    );
  }

  function clear() {
    setSelected([]);
  }

  function playAgain() {
    setResult(null);
    setRevealed(0);
    setError(null);
  }

  async function handlePurchase(isAuto: boolean) {
    setError(null);
    setSubmitting(true);
    const outcome = await purchaseAction(
      isAuto ? { isAuto: true } : { isAuto: false, chosenNumbers: selected }
    );
    setSubmitting(false);

    if (!outcome.ok) {
      setError(outcome.error ?? '구매 중 오류가 발생했습니다.');
      return;
    }

    setResult(outcome);
    setRevealed(0);
    setSelected([]);
    if (outcome.pointsBalance !== undefined) setPoints(outcome.pointsBalance);
  }

  const sortedSelected = [...selected].sort((a, b) => a - b);
  const sum = selected.reduce((a, b) => a + b, 0);
  const evenCount = selected.filter((n) => n % 2 === 0).length;
  const oddCount = selected.length - evenCount;
  const rangeCounts = RANGES.map(([lo, hi]) => selected.filter((n) => n >= lo && n <= hi).length);

  const ticket = result?.ok ? result.ticket : undefined;
  const matches = ticket ? ticket.chosenNumbers.filter((n) => ticket.drawnNumbers.includes(n)).length : 0;

  return (
    <main className="mx-auto max-w-page px-ds-4 pb-ds-8 pt-ds-6">
      <div className="mb-ds-6 flex flex-wrap items-end justify-between gap-ds-4">
        <div>
          <h1 className="text-[36px] leading-[1.05]">번호 선택</h1>
          <p className="mt-ds-2 text-meta text-gray-700">게임당 1,000P · 구매 직후 추첨과 정산이 끝납니다.</p>
        </div>
        <div className="text-right">
          <p className="text-[28px] leading-none tracking-[-0.02em] tabular-nums">
            {points.toLocaleString()}
            <span className="text-[14px]">P</span>
          </p>
          <p className="mt-1.5 text-micro uppercase text-gray-700">보유 포인트</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-ds-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <section>
          <p className="mb-ds-3 text-ui text-gray-800">
            1~45 중 정확히 6개를 선택하세요. <span className="text-ink">({selected.length}/6)</span>
          </p>

          <div className="mb-ds-6 flex min-h-[46px] flex-wrap items-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const n = sortedSelected[i];
              return n === undefined ? (
                <span key={i} className="inline-block size-ball rounded-full border border-dashed border-gray-400" />
              ) : (
                <span
                  key={i}
                  className="inline-flex size-ball animate-ball-pop items-center justify-center rounded-full bg-cyan text-[18px] text-paper"
                >
                  {n}
                </span>
              );
            })}
            {selected.length > 0 && (
              <button type="button" onClick={clear} className="px-1.5 text-meta text-gray-700 underline underline-offset-[3px]">
                지우기
              </button>
            )}
          </div>

          <NumberGrid selected={selected} onToggle={toggle} />

          <div className="mt-ds-6 flex flex-wrap gap-ds-3">
            <button
              type="button"
              disabled={selected.length !== 6 || submitting}
              onClick={() => handlePurchase(false)}
              className={btnPrimary}
            >
              선택 번호로 구매 (1,000P)
            </button>
            <button type="button" disabled={submitting} onClick={() => handlePurchase(true)} className={btnSecondary}>
              자동 선택 구매
            </button>
          </div>
          {error && <p className="mt-ds-3 text-meta text-magenta-700">{error}</p>}
        </section>

        <aside>
          {ticket ? (
            <div className="border-t-[3px] border-ink pt-ds-4">
              <p className={microLabel}>{revealed < 7 ? '추첨 중' : '추첨 결과'}</p>
              <div className="mt-ds-3 flex flex-wrap items-center gap-2">
                {ticket.drawnNumbers.map((n, i) => {
                  if (i >= revealed) {
                    return (
                      <span
                        key={i}
                        className="inline-block size-[42px] animate-tumble rounded-full border border-dashed border-gray-400"
                      />
                    );
                  }
                  const isMatch = ticket.chosenNumbers.includes(n);
                  return (
                    <span
                      key={i}
                      className={`inline-flex size-[42px] animate-ball-drop items-center justify-center rounded-full text-[16px] text-paper ${
                        isMatch ? 'bg-magenta' : 'bg-ink'
                      }`}
                    >
                      {n}
                    </span>
                  );
                })}
                <span className="text-meta text-gray-600">＋</span>
                {revealed >= 7 ? (
                  <span className="inline-flex size-[42px] animate-ball-drop items-center justify-center rounded-full border border-magenta text-[16px] text-magenta-700">
                    {ticket.bonusNumber}
                  </span>
                ) : (
                  <span className="inline-block size-[42px] animate-tumble rounded-full border border-dashed border-gray-400" />
                )}
              </div>

              {revealed >= 7 && (
                <div className="mt-ds-6">
                  <p className="text-[32px] leading-tight">
                    {ticket.rank ? `${RANK_LABEL[ticket.rank]} 당첨! +${ticket.pointsWon.toLocaleString()}P` : '낙첨'}
                  </p>
                  <p className="mt-ds-2 text-ui text-gray-700">
                    {matches}개 일치 · 현재 잔액 {points.toLocaleString()}P
                  </p>
                  <button type="button" onClick={playAgain} className={`${btnSecondary} mt-ds-4`}>
                    한 번 더
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className={microLabel}>추첨 결과</p>
              <p className="mt-ds-3 max-w-[26ch] text-body text-gray-700">
                6개를 선택하고 구매하면 여기서 바로 추첨 결과를 확인할 수 있어요.
              </p>
            </>
          )}

          <p className={`${microLabel} mt-ds-8`}>선택 분석</p>
          <table className="mt-ds-3 w-full border-collapse text-ui">
            <tbody>
              <tr className="border-b border-divider">
                <td className="py-1.5 pr-ds-2 text-gray-700">합계</td>
                <td className="py-1.5 text-right tabular-nums">{selected.length ? sum : '—'}</td>
              </tr>
              <tr className="border-b border-divider">
                <td className="py-1.5 pr-ds-2 text-gray-700">홀 · 짝</td>
                <td className="py-1.5 text-right tabular-nums">
                  {selected.length ? `${oddCount} · ${evenCount}` : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-ds-2 text-gray-700">1등 확률</td>
                <td className="py-1.5 text-right tabular-nums">
                  {selected.length === 6 ? '1 / 8,145,060' : '—'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-ds-4 flex flex-col gap-1.5">
            {RANGES.map(([lo, hi], i) => (
              <div key={lo} className="flex items-center gap-ds-2 text-meta">
                <span className="w-[54px] tabular-nums text-gray-700">
                  {lo}–{hi}
                </span>
                <span className="h-2 min-w-0 flex-1 bg-gray-200">
                  <span
                    className="block h-2 bg-cyan-500"
                    style={{ width: `${(rangeCounts[i] / 6) * 100}%` }}
                  />
                </span>
                <span className="w-3.5 text-right">{rangeCounts[i]}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
