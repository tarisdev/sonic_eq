import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

/** CSS-only tooltip (hover/focus), used to explain audio parameters. */
export function Tooltip({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <span className="tip" data-tip={text} tabIndex={0} role="note" aria-label={text}>
      {children ?? <Info size={13} aria-hidden="true" />}
    </span>
  );
}
