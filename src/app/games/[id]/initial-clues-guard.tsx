import React, { useMemo, type PropsWithChildren } from "react";
import { useAtomValue, useSetAtom } from "jotai/react";
import { atom } from "jotai/vanilla";

import { SetInitialCluesForm } from "~/app/games/[id]/set-initial-clues-form";
import {
  createGameAtom,
  setGameInitialCluesActionAtom,
} from "~/data/games-store";

interface Props {
  id: string;
}

export const InitialCluesGuard: React.FC<PropsWithChildren<Props>> = ({
  id,
  children,
}) => {
  const a = useMemo(() => createGameAtom(id), [id]);
  const clueIdsAtom = useMemo(
    () => atom((get) => get(a)?.clueIds ?? null),
    [a],
  );
  const clueIds = useAtomValue(clueIdsAtom);
  const setGameInitialClues = useSetAtom(setGameInitialCluesActionAtom);

  if (clueIds === null) {
    return (
      <SetInitialCluesForm
        id={id}
        onSetInitialClues={(clueIds) => setGameInitialClues({ id, clueIds })}
      />
    );
  }

  return <>{children}</>;
};
