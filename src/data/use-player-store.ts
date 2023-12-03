import { z } from "zod";
import { create } from "zustand";
import { combine, createJSONStorage, persist } from "zustand/middleware";

import { createSelectors } from "~/data/create-selectors";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Player = z.infer<typeof playerSchema>;

const usePlayersStoreBase = create(
  persist(
    combine({ players: [] as Player[] }, (set) => ({
      add: (player: Player) =>
        set((state) => {
          if (state.players.some((p) => p.name === player.name)) {
            throw new Error(`player name alread exist ${player}`);
          }
          return { players: [...state.players, player] };
        }),
    })),
    {
      name: "players",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const usePlayersStore = createSelectors(usePlayersStoreBase);
