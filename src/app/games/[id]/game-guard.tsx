"use client";

import React, { type PropsWithChildren } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai/react";

import { Button } from "~/components/ui/button";
import { gamesReadOnlyAtom } from "~/data/games-store";

interface Props {
  id: string;
}

export const GameGuard: React.FC<PropsWithChildren<Props>> = ({
  id,
  children,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);

  if (!game) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <p>Game not found.</p>
        <Link href="/games/new">
          <Button>Create Game</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
