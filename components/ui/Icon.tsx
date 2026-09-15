/** Lucide-style stroke icons, inlined so there is no runtime icon dependency. */
type Name = 'search' | 'cart' | 'user' | 'menu' | 'close' | 'arrow-right' | 'plus' | 'minus';

const paths: Record<Name, React.ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>),
  cart: (<><path d="M6 8h12l-1.2 12H7.2L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 21c1.2-4 4-6 7.5-6s6.3 2 7.5 6" /></>),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  'arrow-right': <path d="M5 12h13m0 0-5-5m5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};

export default function Icon({ name, size = 18, className = '' }: { name: Name; size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}
    >
      {paths[name]}
    </svg>
  );
}
