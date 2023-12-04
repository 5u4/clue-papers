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

const gamesAtom = atomWithStorage<Game[]>("games", []);

export const gamesReadOnlyAtom = atom((get) => get(gamesAtom));

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

    set(gamesAtom, (state) => [...state, game]);
    return id;
  },
);

export const setGameInitialCluesActionAtom = atom(
  null,
  (_get, set, props: { id: string; clueIds: string[] }) => {
    set(gamesAtom, (state) => {
      const game = state.find((g) => g.id === props.id);
      if (!game) throw new Error(`cannot find game ${props.id}`);
      game.clueIds = props.clueIds;
      return [...state];
    });
  },
);

export const setGameCustomMarkActionAtom = atom(
  null,
  (get, set, props: { id: string; clueId: string; playerId: string }) => {
    const game = get(gamesAtom).find((g) => g.id === props.id);
    if (!game) throw new Error(`cannot find game ${props.id}`);

    if (!(props.clueId in game.marks)) game.marks[props.clueId] = {};
    const current = game.marks[props.clueId]![props.playerId] ?? null;
    const next: MarkSymbol =
      current === "yes"
        ? null
        : current === "no"
          ? "?"
          : current === "?"
            ? "yes"
            : "no";
    game.marks[props.clueId]![props.playerId] = next;

    set(gamesAtom, (state) => [...state]);
  },
);

export const computeMarks = (game: Game) => {
  const marks: Game["marks"] = {};

  const markYes = (clueId: string, playerId: string) => {
    // TODO mark invalid state
    if (!(clueId in marks)) marks[clueId] = {};
    for (const p of game.players) {
      marks[clueId]![p.id] = p.id === playerId ? "yes" : "no";
    }
    marks[clueId]![ANSWER_PLAYER_ID] = "no";
  };

  const markNo = (
    clueId: string,
    playerId: string,
    disprovedPlayerId: string | null,
  ) => {
    // TODO mark invalid state
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex <= -1) {
      throw new Error(`cannot find player id ${playerId}`);
    }

    const disprovedIndex = game.players.findIndex(
      (p) => p.id === disprovedPlayerId,
    );
    if (disprovedPlayerId !== null && disprovedIndex <= -1) {
      throw new Error(`cannot find disprove player id ${disprovedPlayerId}`);
    }

    const startIndex = (playerIndex + 1) % game.players.length;
    const _endIndex =
      disprovedIndex > -1
        ? disprovedIndex
        : (playerIndex + game.players.length - 1) % game.players.length;
    const endIndex =
      _endIndex < startIndex ? _endIndex + game.players.length : _endIndex;

    if (!(clueId in marks)) marks[clueId] = {};
    let i = startIndex;
    while (true) {
      marks[clueId]![i % game.players.length] = "no";
      if (i === endIndex) break;
      i++;
    }
  };

  // mark initials
  const playerId = game.players.at(0)!.id;
  for (const clueId of game.clueIds ?? []) {
    markYes(clueId, playerId);
    // TODO mark player other clues 'no'
  }

  for (const turn of game.turns) {
    if (turn.type !== "suggestion") continue; // only suggestion can 100% infer

    /**
     * mark all undisproved suggestions no
     */
    for (const clueId of turn.suggestions) {
      // markNo(clueId, turn.player, turn.disproved?.player ?? null);
      // TODO mark question on empty cells
    }

    /**
     * self turn, suggested clues been disproved by others and you see the clue
     */
    if (turn.playerId === playerId && turn.disproved?.clue) {
      markYes(turn.disproved.clue, turn.disproved.player);
    }
  }

  return marks;
};
