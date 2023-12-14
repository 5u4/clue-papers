import React from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai/react";
import TimeAgo from "timeago-react";

import { GameNoteTable } from "~/app/games/[id]/game-note-table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  computeTurnMarkDraft,
  deleteGameTurnActionAtom,
  gamesReadOnlyAtom,
  type Game,
  type Turn,
} from "~/data/games-store";
import { notEmpty } from "~/utils/not-empty";

interface Props {
  id: string;
  marks: Game["marks"];
}

export const GameHistories: React.FC<Props> = ({ id, marks }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  return (
    <div className="flex flex-col gap-y-4 items-center">
      {game.turns.length === 0 && (
        <div className="text-muted-foreground px-2 py-8 text-sm w-full border rounded-md text-center">
          No history yet.
        </div>
      )}

      {game.turns
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .map((turn) => (
          <React.Fragment key={+turn.createdAt}>
            <TurnInfo turn={turn} game={game} marks={marks} />
          </React.Fragment>
        ))}
    </div>
  );
};

const TurnInfo: React.FC<{ game: Game; turn: Turn; marks: Game["marks"] }> = ({
  turn,
  game,
  marks,
}) => {
  const deleteGameTurn = useSetAtom(deleteGameTurnActionAtom);
  const player = game.players.find((p) => p === turn.player);
  if (!player) throw new Error(`cannot find player ${turn.player}`);

  const clues =
    turn.type === "accusation"
      ? turn.accusations
      : turn.type === "suggestion"
        ? turn.suggestions
        : [];

  return (
    <div className="border rounded-md w-full px-4 py-2">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row justify-between space-x-2">
          <p>
            <Explaination turn={turn} />
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Do you want to delete the turn?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => deleteGameTurn({ id: game.id, turn })}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {clues.length > 0 && (
          <GameNoteTable
            id={game.id}
            clues={clues}
            marks={marks}
            displayClues={new Set(clues)}
            boldPlayers={
              new Set(
                [
                  turn.type === "accusation" ? player : undefined,
                  turn.type === "suggestion" && turn.disproved?.player
                    ? turn.disproved.player
                    : undefined,
                ].filter(notEmpty),
              )
            }
            boldClues={
              new Set(
                [
                  turn.type === "suggestion" && turn.disproved?.clue
                    ? turn.disproved.clue
                    : undefined,
                ].filter(notEmpty),
              )
            }
            highlightDraft={computeTurnMarkDraft(turn, game)}
          />
        )}
        <TimeAgo
          className="text-sm text-muted-foreground"
          datetime={turn.createdAt}
        />
      </div>
    </div>
  );
};

const Explaination: React.FC<{
  turn: Turn;
}> = ({ turn }) => {
  if (turn.type === "idle")
    return (
      <>
        Player <span className="font-medium">{turn.player}</span> did nothing.
      </>
    );

  if (turn.type === "suggestion")
    return (
      <>
        Player <span className="font-medium">{turn.player}</span> suggested{" "}
        <span className="font-medium">{turn.suggestions.join(", ")}</span>.
        <br />
        {!turn.disproved ? (
          "No one disproved."
        ) : turn.disproved.clue ? (
          <>
            Player <span className="font-medium">{turn.disproved.player}</span>{" "}
            disproved with clue{" "}
            <span className="font-medium">{turn.disproved.clue}</span>
          </>
        ) : (
          <>
            Player <span className="font-medium">{turn.disproved.player}</span>{" "}
            disproved.
          </>
        )}
      </>
    );

  if (turn.type === "accusation")
    return (
      <>
        Player <span className="font-medium">{turn.player}</span> accused{" "}
        <span className="font-medium">{turn.accusations.join(", ")}</span>{" "}
        {turn.success ? (
          <>
            and <span className="font-medium">succeed</span>
          </>
        ) : (
          <>
            but <span className="font-medium">failed</span>
          </>
        )}
        .
      </>
    );

  throw new Error(`unhandled turn ${JSON.stringify(turn)}`);
};
