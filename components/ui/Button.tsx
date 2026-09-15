'use client';

import Link from 'next/link';

type Variant = 'primary' | 'outline' | 'pill' | 'light';

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  full?: boolean;
  disabled?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-3 h-14 px-8 label transition-colors duration-200 border';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent',
  outline: 'bg-transparent text-ink border-ink hover:bg-accent hover:border-accent hover:text-paper',
  light: 'bg-paper text-ink border-paper hover:bg-accent hover:border-accent hover:text-paper',
  pill: 'bg-ink text-paper border-ink rounded-pill pl-8 pr-3 hover:bg-accent hover:border-accent',
};

/** One button, four skins. Renders as a Link when href is given. */
export default function Button({
  children, href, onClick, variant = 'primary', className = '', type = 'button', ariaLabel, full, disabled,
}: Props) {
  const cls = base + ' ' + variants[variant] + (full ? ' w-full' : '') + ' ' + className;
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  );
}
