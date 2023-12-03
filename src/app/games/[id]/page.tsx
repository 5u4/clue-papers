"use client";

import { GameGuard } from "~/app/games/[id]/game-guard";
import { InitialCluesGuard } from "~/app/games/[id]/initial-clues-guard";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";

export default function Page({ params: { id } }: { params: { id: string } }) {
  return (
    <>
      <H1 className="text-center">Game {id.slice(0, 6)}</H1>
      <div className="h-6" />

      <ClientOnly>
        <Inner id={id} />
      </ClientOnly>
    </>
  );
}

const Inner: React.FC<{ id: string }> = ({ id }) => {
  return (
    <GameGuard id={id}>
      <InitialCluesGuard id={id}>hello</InitialCluesGuard>
    </GameGuard>
  );
};
