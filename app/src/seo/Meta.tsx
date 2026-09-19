/**
 * Per-route document metadata.
 *
 * Zat is prerendered to a real HTML file per route, so this component has two
 * jobs: record metadata during the server render (where the prerenderer reads
 * it back and writes real tags into the file) and keep the live document in
 * sync during client navigation.
 */
import { useEffect } from 'react';
import { absoluteUrl, asset } from '@/lib/routing/base';

export type MetaInput = {
  title: string;
  description: string;
  /** In-app route path, e.g. `/alexden/wardrobe`. */
  path: string;
  /** Path inside `public/`, e.g. `og/home.png`. */
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | null;
};

/**
 * Collected during SSR. The prerenderer reads the last value rendered for a
 * route, which is the innermost <Meta> — nested routes therefore win.
 */
export const metaCollector: { current: MetaInput | null } = { current: null };

function upsert(selector: string, create: () => HTMLElement, content: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  if (el instanceof HTMLMetaElement) el.content = content;
  else if (el instanceof HTMLLinkElement) el.href = content;
  else el.textContent = content;
}

export function Meta(input: MetaInput) {
  // During SSR effects never run, so record synchronously as well.
  metaCollector.current = input;

  const { title, description, path, image, type = 'website', noIndex, jsonLd } = input;

  useEffect(() => {
    const url = absoluteUrl(path);
    const img = absoluteUrl(image ? asset(image).replace(/^\//, '') : 'og/home.png');

    document.title = title;

    const meta = (name: string, value: string, attr: 'name' | 'property' = 'name') =>
      upsert(`meta[${attr}="${name}"]`, () => {
        const el = document.createElement('meta');
        el.setAttribute(attr, name);
        return el;
      }, value);

    meta('description', description);
    meta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    meta('og:title', title, 'property');
    meta('og:description', description, 'property');
    meta('og:url', url, 'property');
    meta('og:type', type, 'property');
    meta('og:image', img, 'property');
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', title);
    meta('twitter:description', description);
    meta('twitter:image', img);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.rel = 'canonical';
      return el;
    }, url);

    const existing = document.getElementById('zat-jsonld');
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'zat-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, type, noIndex, jsonLd]);

  return null;
}
