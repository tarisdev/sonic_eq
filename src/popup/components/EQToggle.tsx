import { t } from '@/i18n';

interface EQToggleProps {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}

/** Accessible on/off switch used for the global EQ state. */
export function EQToggle({ enabled, onToggle, label = 'EQ' }: EQToggleProps) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={enabled}
      aria-label={t(enabled ? 'a11y.switchOn' : 'a11y.switchOff', { label })}
      onClick={onToggle}
    />
  );
}
