"use client";

import { useAtomValue } from "jotai/react";

import { GameGuard } from "~/app/games/[id]/game-guard";
import { GameHistories } from "~/app/games/[id]/game-histories";
import { GameNextActionSheet } from "~/app/games/[id]/game-next-action-sheet";
import { GameNoteTable } from "~/app/games/[id]/game-note-table";
import { InitialCluesGuard } from "~/app/games/[id]/initial-clues-guard";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { clues } from "~/data/clues";
import { computeMarks, gamesReadOnlyAtom } from "~/data/games-store";

export default function Page({ params: { id } }: { params: { id: string } }) {
  return (
    <>
      <H1 className="text-center">Game {id.slice(0, 6)}</H1>
      <div className="h-6" />

      <ClientOnly>
        <Guards id={id} />
      </ClientOnly>
    </>
  );
}

const Guards: React.FC<{ id: string }> = ({ id }) => {
  return (
    <GameGuard id={id}>
      <InitialCluesGuard id={id}>
        <Inner id={id} />
      </InitialCluesGuard>
    </GameGuard>
  );
};

const Inner: React.FC<{ id: string }> = ({ id }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const marks = computeMarks(game);

  return (
    <div className="flex flex-col space-y-4">
      <GameNextActionSheet id={id} />
      <Tabs defaultValue="note">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="note">Note</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="note">
          <GameNoteTable
            id={id}
            clues={[...clues.who, ...clues.what, ...clues.where]}
            marks={marks}
          />
        </TabsContent>
        <TabsContent value="history">
          <GameHistories id={id} marks={marks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
