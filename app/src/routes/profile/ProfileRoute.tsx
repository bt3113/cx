/**
 * A creator's world.
 *
 * Desktop and vertical are two deliberately different compositions of the same
 * data rather than one responsive layout, which is how the references treat
 * them. A Space opens *inside* the world via the nested route below, so the
 * expansion is both an in-place interaction and a real deep link.
 */
import { useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { ProfileShell, WorldFooterRail } from '@/app/ProfileChrome';
import { useIsDesktopWorld } from '@/lib/hooks';
import { repo } from '@/lib/repo';
import { usePublicWorld } from '@/stores/studio';
import { MobileWorld } from '@/world/MobileWorld';
import { SpatialWorld } from '@/world/SpatialWorld';
import { NotFoundRoute } from '@/routes/NotFound';
import { ConnectSheet } from '@/routes/profile/ConnectSheet';
import { Meta } from '@/seo/Meta';
import { personJsonLd } from '@/seo/jsonld';
import { routes } from '@/lib/routing/base';

export function ProfileRoute() {
  const { handle } = useParams();
  const isDesktop = useIsDesktopWorld();
  const [connectOpen, setConnectOpen] = useState(false);
  const { spaceSlug } = useParams();

  // A world published from the Studio in this browser wins over the seeded
  // catalogue, so a creator's own edits show on their public profile.
  const world = usePublicWorld(handle);
  const person = world?.person ?? (handle ? repo.getPerson(handle) : undefined);
  if (!person) return <NotFoundRoute kind="profile" />;

  const spaces = world?.spaces ?? repo.listSpaces(person.id);
  const panelOpen = Boolean(spaceSlug);

  return (
    <>
      <Meta
        title={`${person.name} (@${person.handle}) — Zat`}
        description={person.statement}
        path={routes.profile(person.handle)}
        image={`media/spaces/${spaces[0]?.cover.key.split('/').pop() ?? 'wardrobe'}.webp`}
        jsonLd={personJsonLd(person, spaces)}
      />

      <ProfileShell person={person} onConnect={() => setConnectOpen(true)}>
        {isDesktop ? (
          <div className="relative">
            <SpatialWorld person={person} spaces={spaces} dimmed={panelOpen} />
            <WorldFooterRail person={person} />
          </div>
        ) : (
          <MobileWorld person={person} spaces={spaces} />
        )}

        {/* The opened Space renders above the world. */}
        <Outlet context={{ person }} />
      </ProfileShell>

      <ConnectSheet
        person={person}
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
      />
    </>
  );
}
