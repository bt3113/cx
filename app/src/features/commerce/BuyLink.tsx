/**
 * The outbound commerce link.
 *
 * One component so that every place a visitor can leave for a retailer —
 * the Item page, an opened Space, a saved collection — applies the same
 * `rel`, the same paid-relationship marking and the same outbound event.
 * Commerce is the last step in Zat's hierarchy, not the first, but when a
 * visitor has decided, it should take one click and not three.
 */
import type { MouseEvent } from 'react';
import { cn } from '@/design/cn';
import { track } from '@/lib/analytics/events';
import type { Item } from '@/lib/schema';

const CURRENCY: Record<Item['currency'], string> = { GBP: '£', USD: '$', EUR: '€' };

/** Price as a visitor reads it, or null when the item is not for sale. */
export function itemPrice(item: Item): string | null {
  if (item.price === null) return null;
  if (item.price === 0) return 'Free';
  return `${CURRENCY[item.currency]}${item.price.toLocaleString('en-GB', {
    minimumFractionDigits: item.price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Search engines require paid relationships to be marked. `sponsored` is
 * added for exactly the two disclosure states that are paid; everything else
 * still gets `nofollow` because these are creator-supplied destinations.
 */
export function outboundRel(item: Item): string {
  const paid = item.disclosure === 'affiliate' || item.disclosure === 'sponsored';
  return paid ? 'noopener noreferrer nofollow sponsored' : 'noopener noreferrer nofollow';
}

/**
 * Compact buy affordance for a tile or row. Rendered as a real anchor so it
 * keeps middle-click, "open in new tab" and the browser's own status bar.
 *
 * It is frequently nested inside a larger link to the Item page, so the click
 * has to stop propagating — otherwise the router would navigate the page out
 * from under the window that is opening.
 */
export function BuyLink({
  item,
  className,
  label = 'Buy',
}: {
  item: Item;
  className?: string;
  label?: string;
}) {
  if (!item.productUrl) return null;

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    track({ type: 'outbound', targetType: 'item', targetId: item.id });
  };

  return (
    <a
      href={item.productUrl}
      target="_blank"
      rel={outboundRel(item)}
      onClick={onClick}
      data-buy={item.slug}
      aria-label={`${label} ${item.title}${item.retailer ? ` at ${item.retailer}` : ''} — opens in a new tab`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-bronze-600/60 bg-bronze-500/12',
        'px-3 py-1.5 text-[11.5px] font-medium tracking-[0.01em] whitespace-nowrap text-bronze-100',
        'transition-colors duration-200 hover:border-bronze-400 hover:bg-bronze-500/22',
        'focus-visible:ring-2 focus-visible:ring-bronze-300 focus-visible:outline-none',
        className,
      )}
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
