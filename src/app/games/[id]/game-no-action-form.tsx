import React from "react";
import { useAtomValue, useSetAtom } from "jotai/react";
import { nanoid } from "nanoid";

import { Button } from "~/components/ui/button";
import { addGameTurnActionAtom, gamesReadOnlyAtom } from "~/data/games-store";

interface Props {
  id: string;
  player: string;
  onMakeIdle: () => void;
}

export const GameNoActionForm: React.FC<Props> = ({
  id,
  player,
  onMakeIdle,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const addGameTurn = useSetAtom(addGameTurnActionAtom);

  return (
    <div>
      <Button
        className="w-full"
        onClick={() => {
          addGameTurn({
            id,
            turn: {
              id: nanoid(),
              type: "idle",
              player,
              createdAt: new Date(),
            },
          });
          onMakeIdle();
        }}
      >
        Continue
      </Button>
    </div>
  );
};
