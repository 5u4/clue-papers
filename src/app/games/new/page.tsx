"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { AddPlayerButton } from "~/app/games/new/add-player-button";
import { PlayerListSort } from "~/app/games/new/player-list-sort";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";
import { Button } from "~/components/ui/button";

const GAME_PLAYERS_KEY = "p";

export default function Page() {
  return (
    <>
      <H1 className="text-center">New Game</H1>
      <div className="h-6" />

      <ClientOnly>
        <Inner />
      </ClientOnly>
    </>
  );
}

const Inner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const gamePlayerNames = useMemo(() => {
    const raw = searchParams.get(GAME_PLAYERS_KEY);
    try {
      return z.array(z.string()).parse(JSON.parse(raw ?? "[]"));
    } catch (e) {
      return [];
    }
  }, [searchParams]);

  const setGamePlayerNames = (names: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(GAME_PLAYERS_KEY, JSON.stringify(names));
    router.push(pathname + "?" + newParams.toString());
  };

  return (
    <div className="flex flex-col space-y-4">
      <AddPlayerButton
        selectedPlayerNames={gamePlayerNames}
        onAddPlayerName={(name) => {
          setGamePlayerNames(Array.from(new Set([...gamePlayerNames, name])));
        }}
      />

      <PlayerListSort
        playerNames={gamePlayerNames}
        setPlayerNameOrder={setGamePlayerNames}
      />

      <Button className="w-full" disabled={gamePlayerNames.length < 2}>
        Start Game
      </Button>
    </div>
  );
};
