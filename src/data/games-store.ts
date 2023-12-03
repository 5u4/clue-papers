import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { nanoid } from "nanoid";
import { z } from "zod";

import {
  addPlayerActionAtom,
  playerSchema,
  playersReadOnlyAtom,
} from "./players-store";

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

const gameIdsAtom = atomWithStorage<string[]>("games", []);

export const gamesIdsReadOnlyAtom = atom((get) => get(gameIdsAtom));

const createGamePropsSchema = z.object({ names: z.array(z.string()).min(2) });
export const createGameActionAtom = atom(
  null,
  (get, set, props: z.infer<typeof createGamePropsSchema>) => {
    props = createGamePropsSchema.parse(props);
    const existingPlayers = get(playersReadOnlyAtom);
    const missings = props.names.filter((name) =>
      existingPlayers.every((p) => p.name !== name),
    );

    for (const missing of missings) {
      set(addPlayerActionAtom, { name: missing });
    }

    const newExistingPlayers = get(playersReadOnlyAtom);

    const players = props.names.map((name) => {
      const p = newExistingPlayers.find((p) => p.name === name);
      if (!p) throw new Error(`missing player ${name}`);
      return p;
    });

    const id = nanoid();
    const game = {
      id,
      players,
      clueIds: null,
      marks: {},
      turns: [],
      createdAt: new Date(),
    } satisfies Game as Game;
    const gameAtom = createGameAtom(id, game);
    set(gameAtom, game);
    return id;
  },
);

export const createGameAtom = (
  id: string,
  initial?: z.infer<typeof gameSchema> | undefined,
) =>
  atomWithStorage<Game | null>(`game-${id}`, initial ?? null, undefined, {
    getOnInit: true,
  });

export const setGameInitialCluesActionAtom = atom(
  null,
  (get, set, props: { id: string; clueIds: string[] }) => {
    const a = createGameAtom(props.id);
    const game = get(a);
    if (!game) throw new Error(`missing game ${props.id}`);
    set(a, { ...game, clueIds: props.clueIds });
  },
);
