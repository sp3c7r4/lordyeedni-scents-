'use client';

export default function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'h-9 border px-4 text-[11px] uppercase tracking-wide transition-colors ' +
        (active ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-copy hover:border-ink')
      }
    >
      {label}
    </button>
  );
}
