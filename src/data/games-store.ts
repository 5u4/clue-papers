import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { nanoid } from "nanoid";
import { z } from "zod";

import { addPlayerActionAtom, playersReadOnlyAtom } from "./players-store";

export const ANSWER_PLAYER_ID = "-";

const baseTurnSchema = z.object({
  player: z.string(),
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
export type Turn = z.infer<typeof turnSchema>;

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
  players: z.array(z.string()),
  clues: z.array(z.string()).nullable(),
  turns: z.array(turnSchema),
  marks: z.record(
    /** clue */
    z.string(),
    z.record(
      /** player */
      z.string(),
      markSymbolSchema,
    ),
  ),
  createdAt: z.coerce.date(),
});
export type Game = z.infer<typeof gameSchema>;

const gamesAtom = atomWithStorage<Game[]>("games", [], undefined, {
  getOnInit: true,
});

export const gamesReadOnlyAtom = atom((get) => get(gamesAtom));

const createGamePropsSchema = z.object({ names: z.array(z.string()).min(2) });
export const createGameActionAtom = atom(
  null,
  (get, set, props: z.infer<typeof createGamePropsSchema>) => {
    props = createGamePropsSchema.parse(props);
    const existingPlayers = get(playersReadOnlyAtom);
    const missings = props.names.filter((name) =>
      existingPlayers.every((p) => p !== name),
    );

    for (const missing of missings) {
      set(addPlayerActionAtom, missing);
    }

    const id = nanoid();
    const game = {
      id,
      players: props.names,
      marks: {},
      clues: null,
      turns: [],
      createdAt: new Date(),
    } satisfies Game as Game;

    set(gamesAtom, (state) => [...state, game]);
    return id;
  },
);

export const setGameInitialCluesActionAtom = atom(
  null,
  (_get, set, props: { id: string; clues: string[] }) => {
    set(gamesAtom, (state) => {
      const game = state.find((g) => g.id === props.id);
      if (!game) throw new Error(`cannot find game ${props.id}`);
      game.clues = props.clues;
      return [...state];
    });
  },
);

export const setGameCustomMarkActionAtom = atom(
  null,
  (get, set, props: { id: string; clue: string; player: string }) => {
    const game = get(gamesAtom).find((g) => g.id === props.id);
    if (!game) throw new Error(`cannot find game ${props.id}`);

    if (!(props.clue in game.marks)) game.marks[props.clue] = {};
    const current = game.marks[props.clue]![props.player] ?? null;
    const next: MarkSymbol =
      current === "yes"
        ? null
        : current === "no"
          ? "?"
          : current === "?"
            ? "yes"
            : "no";
    game.marks[props.clue]![props.player] = next;

    set(gamesAtom, (state) => [...state]);
  },
);

export const addGameTurnActionAtom = atom(
  null,
  (get, set, props: { id: string; turn: Turn }) => {
    const game = get(gamesAtom).find((g) => g.id === props.id);
    if (!game) throw new Error(`cannot find game ${props.id}`);

    game.turns.push({ ...props.turn });

    set(gamesAtom, (state) => [...state]);
  },
);

export const computeMarks = (game: Game) => {
  const marks: Game["marks"] = {};

  const markYes = (clueId: string, player: string) => {
    // TODO mark invalid state
    if (!(clueId in marks)) marks[clueId] = {};
    for (const p of game.players) {
      marks[clueId]![p] = p === player ? "yes" : "no";
    }
    marks[clueId]![ANSWER_PLAYER_ID] =
      player === ANSWER_PLAYER_ID ? "yes" : "no";
  };

  const markNo = (
    clue: string,
    player: string,
    disprovedPlayer: string | null,
  ) => {
    // TODO mark invalid state
    const playerIndex = game.players.findIndex((p) => p === player);
    if (playerIndex <= -1) {
      throw new Error(`cannot find player id ${player}`);
    }

    const disprovedIndex = game.players.findIndex((p) => p === disprovedPlayer);
    if (disprovedPlayer !== null && disprovedIndex <= -1) {
      throw new Error(`cannot find disprove player id ${disprovedPlayer}`);
    }

    const startIndex = (playerIndex + 1) % game.players.length;
    const _endIndex =
      ((disprovedIndex > -1 ? disprovedIndex : playerIndex) +
        game.players.length -
        1) %
      game.players.length;
    const endIndex =
      _endIndex < startIndex ? _endIndex + game.players.length : _endIndex;

    if (!(clue in marks)) marks[clue] = {};

    for (let i = startIndex; i <= endIndex; i++) {
      const pid = game.players.at(i % game.players.length);
      if (pid) marks[clue]![pid] = "no";
    }
  };

  // mark initials
  const player = game.players.at(0)!;
  for (const clue of game.clues ?? []) {
    markYes(clue, player);
    // TODO mark player other clues 'no'
  }

  for (const turn of game.turns) {
    if (turn.type === "suggestion") {
      /**
       * mark all undisproved suggestions no
       */
      for (const clue of turn.suggestions) {
        markNo(clue, turn.player, turn.disproved?.player ?? null);
        // TODO mark question on empty cells
      }

      /**
       * self turn, suggested clues been disproved by others and you see the clue
       */
      if (turn.player === player && turn.disproved?.clue) {
        markYes(turn.disproved.clue, turn.disproved.player);
      }
    }

    if (turn.type === "accusation") {
      if (turn.success) {
        for (const clue of turn.accusations) {
          markYes(clue, ANSWER_PLAYER_ID);
        }
      }
    }
  }

  return marks;
};
