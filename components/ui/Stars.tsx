import { stars } from '@/lib/format';

export default function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={'tracking-widest text-accent ' + className} aria-label={rating.toFixed(1) + ' out of 5'}>
      {stars(rating)}
    </span>
  );
}
