import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * DisclaimerBanner — compact inline educational disclaimer.
 * The large standalone "Medical AI Notice" card has been intentionally removed.
 * A concise inline reminder is shown wherever needed for context.
 */
export const DisclaimerBanner = ({ compact = false }) => {
  // Both compact and default now render the same subtle inline strip.
  // The large standalone popup/card is no longer displayed.
  return (
    <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl px-4 py-2.5 text-xs text-amber-200/70 flex items-center gap-2.5">
      <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
      <span>
        <strong className="text-amber-300/80">Educational Prototype:</strong>{' '}
        Not intended for clinical diagnosis. Consult a qualified medical professional.
      </span>
    </div>
  );
};

export default DisclaimerBanner;
