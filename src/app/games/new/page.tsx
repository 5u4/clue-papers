"use client";

import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai/react";

import { AddPlayerButton } from "~/app/games/new/add-player-button";
import { PlayerListSort } from "~/app/games/new/player-list-sort";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";
import { Button } from "~/components/ui/button";
import { createGameActionAtom } from "~/data/games-store";
import { useNewGame } from "~/data/use-new-game";

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
  const { names, setNames } = useNewGame();
  const router = useRouter();

  const createGame = useSetAtom(createGameActionAtom);

  const startGame = () => {
    const gameId = createGame({ names });
    router.push(`/games/${gameId}`);
  };

  return (
    <div className="flex flex-col space-y-4">
      <AddPlayerButton
        selectedPlayerNames={names}
        onAddPlayerName={(name) => {
          setNames(Array.from(new Set([...names, name])));
        }}
      />

      <PlayerListSort playerNames={names} setPlayerNameOrder={setNames} />

      <Button
        className="w-full"
        disabled={names.length < 2}
        onClick={startGame}
      >
        Start Game
      </Button>
    </div>
  );
};
