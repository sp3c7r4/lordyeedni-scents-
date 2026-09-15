'use client';

import Icon from './Icon';

export default function QtyStepper({
  qty, onDec, onInc, size = 'md',
}: { qty: number; onDec: () => void; onInc: () => void; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-14';
  const w = size === 'sm' ? 'w-9' : 'w-12';
  return (
    <div className={'flex items-center border border-line ' + h}>
      <button type="button" onClick={onDec} aria-label="Decrease quantity" className={'grid h-full place-items-center hover:text-accent ' + w}>
        <Icon name="minus" size={14} />
      </button>
      <span className="w-9 text-center text-sm">{qty}</span>
      <button type="button" onClick={onInc} aria-label="Increase quantity" className={'grid h-full place-items-center hover:text-accent ' + w}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
