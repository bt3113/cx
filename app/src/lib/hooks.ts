import { useCallback, useEffect, useState } from 'react';

/**
 * Media query as state.
 *
 * Initialised from a real match so the first paint is correct rather than
 * flashing the mobile composition on desktop.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** The breakpoint at which the full spatial world becomes readable. */
export const useIsDesktopWorld = () => useMediaQuery('(min-width: 1280px)');

/** Locks background scroll while a dialog or sheet is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    // Compensating for the scrollbar stops the layout jumping on open.
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Copy-to-clipboard with a short-lived "copied" acknowledgement. */
export function useCopy(resetAfter = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        return true;
      } catch {
        // Clipboard access is denied in some embedded contexts; fall back to
        // a selection-based copy rather than failing silently.
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          setCopied(ok);
          return ok;
        } catch {
          return false;
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), resetAfter);
    return () => clearTimeout(t);
  }, [copied, resetAfter]);

  return { copied, copy };
}
