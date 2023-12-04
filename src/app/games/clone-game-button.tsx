import React, { type PropsWithChildren } from "react";
import { useAtomValue } from "jotai/react";

import { Button } from "~/components/ui/button";
import { gamesReadOnlyAtom } from "~/data/games-store";

interface Props {
  id: string;
}

export const CloneGameButton: React.FC<PropsWithChildren<Props>> = ({
  id,
  children,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  return <Button>{children}</Button>;
};
