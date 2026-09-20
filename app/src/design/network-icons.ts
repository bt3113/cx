/**
 * Icons for a creator's links.
 *
 * Deliberately generic glyphs rather than brand marks: reproducing a
 * platform's logo means reproducing its trademark, and lucide removed its
 * brand set for the same reason. A network is identified by its label, not
 * by borrowed artwork.
 */
import { AtSign, Brush, Briefcase, Globe, Music2, Play } from 'lucide-react';
import type { ComponentType } from 'react';

type Glyph = ComponentType<{ className?: string; strokeWidth?: number }>;

export const NETWORK_ICON: Record<string, Glyph> = {
  instagram: AtSign,
  x: AtSign,
  tiktok: Music2,
  youtube: Play,
  linkedin: Briefcase,
  dribbble: Brush,
  website: Globe,
};

export const NETWORK_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  x: 'X',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  dribbble: 'Dribbble',
  website: 'Website',
};

export function networkIcon(network: string): Glyph {
  return NETWORK_ICON[network] ?? Globe;
}

export function networkLabel(network: string): string {
  return NETWORK_LABEL[network] ?? network;
}
