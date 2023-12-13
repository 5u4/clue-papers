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
  clues: string[];
  marks: Game["marks"];
  displayClues?: Set<string> | undefined;
  showBorderBThick?: boolean | undefined;
}

export const GameNoteTable: React.FC<Props> = ({
  id,
  clues,
  marks,
  displayClues = new Set([ANSWER_PLAYER_ID, ...clues]),
  showBorderBThick = false,
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
                key={player}
                className="text-center text-xs px-0.5 min-w-[42px]"
              >
                {player}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clues
            .filter((clue) => displayClues.has(clue))
            .map((clue) => {
              const ansMark = marks[clue]?.[ANSWER_PLAYER_ID];
              return (
                <TableRow key={clue}>
                  <TableCell
                    className={cn(
                      "text-center py-1 px-0.5 text-xs",
                      ansMark && "bg-green-50",
                      showBorderBThick &&
                        (clue === "Professor Plum" || clue === "Wrench") &&
                        "border-b-4",
                    )}
                  >
                    {clue}
                  </TableCell>
                  <NoteCell
                    id={id}
                    marks={marks}
                    clue={clue}
                    player={ANSWER_PLAYER_ID}
                    borderBThick={
                      showBorderBThick &&
                      (clue === "Professor Plum" || clue === "Wrench")
                    }
                  />
                  {Array.from({ length: game.players.length }).map((_, i) => {
                    return (
                      <NoteCell
                        id={id}
                        marks={marks}
                        clue={clue}
                        player={game.players[i]!}
                        key={i}
                        borderBThick={
                          showBorderBThick &&
                          (clue === "Professor Plum" || clue === "Wrench")
                        }
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
  clue: string;
  player: string;
  borderBThick?: boolean | undefined;
}> = ({ id, marks, clue, player, borderBThick = false }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const mark = marks[clue]?.[player];
  const customMark = game.marks[clue]?.[player];

  const setGameCustomMark = useSetAtom(setGameCustomMarkActionAtom);

  return (
    <TableCell
      className={cn(
        "text-center px-0.5",
        mark && "bg-green-50",
        borderBThick && "border-b-4",
      )}
    >
      <Button
        disabled={mark === "yes" || mark === "no"}
        variant="link"
        size="icon"
        onClick={() => {
          setGameCustomMark({ id: game.id, clue, player });
        }}
      >
        {markToDisplay(mark ?? customMark ?? null)}
      </Button>
    </TableCell>
  );
};
