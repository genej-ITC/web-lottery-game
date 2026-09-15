export function DatelineRail({
  left,
  center,
  right,
}: {
  left: string;
  center?: string;
  right: string;
}) {
  return (
    <div className="mb-ds-6 flex justify-between gap-ds-4 border-t border-ink pt-[7px] text-micro uppercase text-gray-700">
      <span>{left}</span>
      {center && <span>{center}</span>}
      <span>{right}</span>
    </div>
  );
}
