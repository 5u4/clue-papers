import React, { type PropsWithChildren } from "react";
import { useAtomValue, useSetAtom } from "jotai/react";

import { SetInitialCluesForm } from "~/app/games/[id]/set-initial-clues-form";
import {
  gamesReadOnlyAtom,
  setGameInitialCluesActionAtom,
} from "~/data/games-store";

interface Props {
  id: string;
}

export const InitialCluesGuard: React.FC<PropsWithChildren<Props>> = ({
  id,
  children,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);

  const setGameInitialClues = useSetAtom(setGameInitialCluesActionAtom);

  if (game?.clues === null) {
    return (
      <SetInitialCluesForm
        id={id}
        onSetInitialClues={(clues) => setGameInitialClues({ id, clues })}
      />
    );
  }

  return <>{children}</>;
};
