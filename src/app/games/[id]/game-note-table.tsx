import React from "react";
import { useAtomValue, useSetAtom } from "jotai/react";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type Clue } from "~/data/clues";
import {
  ANSWER_PLAYER_ID,
  gamesReadOnlyAtom,
  markToDisplay,
  setGameCustomMarkActionAtom,
  type Game,
} from "~/data/games-store";
import { cn } from "~/utils/ui";

interface Props {
  id: string;
  clues: Clue[];
  marks: Game["marks"];
  displayClueIds?: Set<string> | undefined;
}

export const GameNoteTable: React.FC<Props> = ({
  id,
  clues,
  marks,
  displayClueIds = new Set([
    ANSWER_PLAYER_ID,
    ...clues.map((clue) => clue.full),
  ]),
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  return (
    <div className="rounded-md border">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {/* item */}
            <TableHead className="min-w-[42px]"></TableHead>
            {/* answer */}
            <TableHead className="min-w-[42px]"></TableHead>
            {game.players.map((player) => (
              <TableHead
                key={player.id}
                className="text-center text-xs px-0.5 min-w-[42px]"
              >
                {player.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clues
            .filter((clue) => displayClueIds.has(clue.full))
            .map((clue) => {
              const ansMark = marks[clue.full]?.[ANSWER_PLAYER_ID];
              return (
                <TableRow key={clue.full}>
                  <TableCell
                    className={cn(
                      "text-center py-1 px-0.5 text-xs",
                      ansMark && "bg-green-100",
                    )}
                  >
                    {clue.icon}
                    <br />
                    {clue.short}
                  </TableCell>
                  <NoteCell
                    id={id}
                    marks={marks}
                    clueId={clue.full}
                    playerId={ANSWER_PLAYER_ID}
                  />
                  {Array.from({ length: game.players.length }).map((_, i) => {
                    return (
                      <NoteCell
                        id={id}
                        marks={marks}
                        clueId={clue.full}
                        playerId={game.players[i]!.id}
                        key={i}
                      />
                    );
                  })}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};

const NoteCell: React.FC<{
  id: string;
  marks: Game["marks"];
  clueId: string;
  playerId: string;
}> = ({ id, marks, clueId, playerId }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const mark = marks[clueId]?.[playerId];
  const customMark = game.marks[clueId]?.[playerId];

  const setGameCustomMark = useSetAtom(setGameCustomMarkActionAtom);

  return (
    <TableCell className={cn("text-center px-0.5", mark && "bg-green-100")}>
      <Button
        disabled={mark === "yes" || mark === "no"}
        variant="link"
        size="icon"
        onClick={() => {
          setGameCustomMark({ id: game.id, clueId, playerId });
        }}
      >
        {markToDisplay(mark ?? customMark ?? null)}
      </Button>
    </TableCell>
  );
};
