import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { clues } from "./clues";
import { addPlayerActionAtom, playersReadOnlyAtom } from "./players-store";

export const ANSWER_PLAYER_ID = "-";

const baseTurnSchema = z.object({
  id: z.string().nullish(),
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
  mark === "no" ? "❌" : mark === "?" ? "❓" : mark === "yes" ? "⭕️" : "⬜️";

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

const gamesAtom = atomWithStorage<Game[]>("games-v3", [], undefined, {
  getOnInit: true,
});

export const gamesReadOnlyAtom = atom((get) =>
  z.array(gameSchema).parse(get(gamesAtom)),
);

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

    const games = get(gamesAtom);
    let id: string | null = null;
    // avoid id collision
    while (true) {
      id = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)();
      if (games.every((g) => g.id !== id)) break;
    }

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

export const deleteGameTurnActionAtom = atom(
  null,
  (get, set, props: { id: string; turn: Turn }) => {
    const game = get(gamesAtom).find((g) => g.id === props.id);
    if (!game) throw new Error(`cannot find game ${props.id}`);

    game.turns = game.turns.filter(
      (turn) =>
        turn.id !== props.turn.id && +turn.createdAt !== +props.turn.createdAt,
    );
    set(gamesAtom, (state) => [...state]);
  },
);

export const deleteGameActionAtom = atom(null, (_get, set, id: string) => {
  set(gamesAtom, (state) => state.filter((g) => g.id !== id));
});

export const computeTurnMarkDraft = (turn: Turn, game: Game) => {
  const draft: Game["marks"] = {};
  if (turn.type === "suggestion") {
    let currentPlayer = turn.player;
    const nextPlayer = () =>
      game.players[
        (game.players.findIndex((v) => v === currentPlayer) + 1) %
          game.players.length
      ];
    currentPlayer = nextPlayer();
    while (true) {
      const shouldStop =
        currentPlayer === turn.player || // when round back to player
        currentPlayer === turn.disproved?.player; // when someone disproved
      if (shouldStop) break;
      for (const clue of turn.suggestions) {
        if (!(clue in draft)) draft[clue] = {};
        draft[clue][currentPlayer] = "no";
      }
      currentPlayer = nextPlayer();
    }
    if (turn.disproved?.clue) {
      if (!(turn.disproved.clue in draft)) draft[turn.disproved.clue] = {};
      for (const player of game.players) {
        draft[turn.disproved.clue][player] =
          player === turn.disproved.player ? "yes" : "no";
      }
      draft[turn.disproved.clue][ANSWER_PLAYER_ID] = "no";
    }
  }

  if (turn.type === "accusation" && turn.success) {
    for (const clue of turn.accusations) {
      draft[clue][ANSWER_PLAYER_ID] = "yes";
      for (const player of game.players) {
        draft[clue][player] = "no";
      }
    }
  }

  return draft;
};

export const applyDraft = (current: Game["marks"], draft: Game["marks"]) => {
  current = JSON.parse(JSON.stringify(current)) as Game["marks"];
  draft = JSON.parse(JSON.stringify(draft)) as Game["marks"];

  const conflicts: { clue: string; player: string; value: MarkSymbol }[] = [];
  for (const [clue, x] of Object.entries(draft)) {
    for (const [player, draftValue] of Object.entries(x)) {
      const currentCell = current?.[clue]?.[player];
      if (
        (currentCell === "yes" || currentCell === "no") &&
        currentCell !== draftValue
      ) {
        conflicts.push({ clue, player, value: currentCell });
        continue;
      }
      if (!(clue in current)) current[clue] = {};
      current[clue][player] = draftValue;
    }
  }

  return { current, conflicts };
};

export const computeMarks = (game: Game) => {
  let marks: Game["marks"] = {};

  // mark initials
  const self = game.players.at(0)!;
  for (const clue of game.clues ?? []) {
    if (!(clue in marks)) marks[clue] = {};
    for (const player of game.players) {
      marks[clue][player] = player === self ? "yes" : "no";
      marks[clue][ANSWER_PLAYER_ID] = "no";
    }
  }
  for (const clue of clues) {
    if (!(clue in marks)) marks[clue] = {};
    if (!(self in marks[clue])) marks[clue][self] = "no";
  }

  const drafts = game.turns
    .toSorted((a, b) => +a.createdAt - +b.createdAt)
    .map((turn) => computeTurnMarkDraft(turn, game));

  for (const draft of drafts) {
    const { current, conflicts } = applyDraft(marks, draft);
    if (conflicts.length > 0) throw new Error(`invalid turns`);
    marks = current;
  }

  return marks;
};
