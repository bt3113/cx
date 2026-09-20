/**
 * Modal surface built on the native `<dialog>` element.
 *
 * Using the platform element rather than a div means focus trapping, Escape
 * to close, inertness of the page behind and top-layer stacking are handled
 * by the browser — which is both less code and more correct than a hand-rolled
 * trap.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide the visible heading but keep it for assistive technology. */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  /** `sheet` slides from the bottom on small screens. */
  variant?: 'centred' | 'sheet';
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  variant = 'centred',
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // `cancel` fires on Escape; letting it through would close without telling
  // React, leaving `open` true and the dialog un-reopenable.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onClickOutside = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener('cancel', onCancel);
    el.addEventListener('click', onClickOutside);
    return () => {
      el.removeEventListener('cancel', onCancel);
      el.removeEventListener('click', onClickOutside);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dlg-title"
      aria-describedby={description ? 'dlg-desc' : undefined}
      className={cn(
        'zat-dialog m-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-black/72 backdrop:backdrop-blur-sm',
        'fixed inset-0 h-full w-full',
      )}
    >
      <div
        className={cn(
          'flex h-full w-full',
          variant === 'sheet' ? 'items-end sm:items-center' : 'items-center',
          'justify-center p-0 sm:p-6',
        )}
      >
        <div
          className={cn(
            'glass relative flex max-h-[92dvh] w-full flex-col overflow-hidden',
            variant === 'sheet'
              ? 'rounded-t-[26px] sm:rounded-[var(--radius-panel)]'
              : 'rounded-[var(--radius-panel)]',
            'sm:max-w-[560px]',
            'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="min-w-0">
              <h2
                id="dlg-title"
                className={cn(
                  'font-display text-d6 leading-tight',
                  hideTitle && 'sr-only',
                )}
              >
                {title}
              </h2>
              {description ? (
                <p id="dlg-desc" className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:bg-white/8 hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-2">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
