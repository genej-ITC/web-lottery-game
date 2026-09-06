'use client';

import { useState } from 'react';
import { NumberGrid } from '@/components/NumberGrid';
import { purchaseAction, type PurchaseActionResult } from './actions';
import { RANK_LABEL } from '@/lib/rank';

export function PlayClient() {
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseActionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : prev.length < 6 ? [...prev, n] : prev
    );
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
    setSelected([]);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">번호 선택</h1>
      <p className="mb-4 text-sm text-gray-600">
        1~45 중 정확히 6개를 선택하세요. ({selected.length}/6)
      </p>

      <NumberGrid selected={selected} onToggle={toggle} />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={selected.length !== 6 || submitting}
          onClick={() => handlePurchase(false)}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          선택 번호로 구매 (1,000P)
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => handlePurchase(true)}
          className="rounded border border-blue-600 px-4 py-2 text-blue-600 disabled:opacity-50"
        >
          자동 선택 구매
        </button>
      </div>

      {result?.ok && result.ticket && (
        <div className="mt-8 rounded border bg-white p-4">
          <p className="font-semibold">내 번호: {result.ticket.chosenNumbers.join(', ')}</p>
          <p>
            당첨 번호: {result.ticket.drawnNumbers.join(', ')} + 보너스 {result.ticket.bonusNumber}
          </p>
          <p className="mt-2 text-lg font-bold">
            {result.ticket.rank
              ? `${RANK_LABEL[result.ticket.rank]} 당첨! +${result.ticket.pointsWon.toLocaleString()}P`
              : '낙첨'}
          </p>
          <p className="text-sm text-gray-600">현재 잔액: {result.pointsBalance?.toLocaleString()}P</p>
        </div>
      )}
    </main>
  );
}
