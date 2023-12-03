import { z } from "zod";
import { create } from "zustand";
import { combine, createJSONStorage, persist } from "zustand/middleware";

import { createSelectors } from "./create-selectors";
import { playerSchema } from "./use-player-store";

export const ANSWER_PLAYER_ID = "-";

const baseTurnSchema = z.object({
  playerId: z.string(),
  createdAt: z.coerce.date(),
});

export const turnSchema = z.discriminatedUnion("type", [
  baseTurnSchema.extend({ type: z.literal("idle") }),
  baseTurnSchema.extend({
    type: z.literal("suggestion"),
    suggestions: z.array(z.string()),
    disproved: z
      .object({ player: z.string(), clue: z.string().nullable() })
      .nullable(),
  }),
  baseTurnSchema.extend({
    type: z.literal("accusation"),
    accusations: z.array(z.string()),
    success: z.boolean(),
  }),
]);

const markSymbolSchema = z.union([
  z.literal("no"),
  z.literal("yes"),
  z.literal("?"),
  z.null(),
]);
export type MarkSymbol = z.infer<typeof markSymbolSchema>;
export const markToDisplay = (mark: MarkSymbol) =>
  mark === "no" ? "❌" : mark === "?" ? "❓" : mark === "yes" ? "✅" : "⬜️";

export const gameSchema = z.object({
  id: z.string(),
  players: z.array(playerSchema),
  clueIds: z.array(z.string()).nullable(),
  turns: z.array(turnSchema),
  marks: z.record(
    /** clue id */
    z.string(),
    z.record(
      /** player id */
      z.string(),
      markSymbolSchema,
    ),
  ),
  createdAt: z.coerce.date(),
});
export type Game = z.infer<typeof gameSchema>;

const useGamesStoreBase = create(
  persist(
    combine({ gameIds: [] as string[] }, (set) => ({
      newGame: (playerNames: string[]) => {},
    })),
    { name: "games", storage: createJSONStorage(() => localStorage) },
  ),
);
export const useGamesStore = createSelectors(useGamesStoreBase);

export const createGameStore = (id: string) =>
  create(
    persist(
      combine(
        {
          id,
          players: [],
          clueIds: null,
          turns: [],
          marks: {},
          createdAt: new Date(),
        } satisfies Game as Game,
        (set) => ({}),
      ),
      {
        name: `game-${id}`,
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
