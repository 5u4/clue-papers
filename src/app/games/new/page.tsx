"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useSetAtom } from "jotai/react";

import { AddPlayerButton } from "~/app/games/new/add-player-button";
import { PlayerListSort } from "~/app/games/new/player-list-sort";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";
import { Nav } from "~/components/nav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { createGameActionAtom } from "~/data/games-store";
import { useNewGame } from "~/data/use-new-game";

export default function Page() {
  return (
    <>
      <Nav>
        <H1>New Game</H1>
      </Nav>

      <ClientOnly>
        <Inner />
      </ClientOnly>
    </>
  );
}

const Inner = () => {
  const { names, setNames } = useNewGame();
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  const createGame = useSetAtom(createGameActionAtom);

  const startGame = () => {
    setStarting(true);
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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full" disabled={names.length < 2 || starting}>
            {starting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Start Game
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm order correctly</AlertDialogTitle>
            <AlertDialogDescription>
              You are playing as{" "}
              <span className="font-semibold underline">{names[0]}</span>. The
              players after you are{" "}
              <span className="font-semibold underline">
                {names.slice(1).join(", ")}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={startGame}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
