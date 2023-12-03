import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { z } from "zod";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Player = z.infer<typeof playerSchema>;

const _playersAtom = atomWithStorage<Player[]>("players", []);
export const playersAtom = atom((get) => get(_playersAtom));

export const addPlayerAtom = atom(null, (get, set, update: Player) => {
  const players = get(playersAtom);
  if (players.some((p) => p.name === update.name)) {
    throw new Error(`player name is taken ${update}`);
  }
  set(_playersAtom, [...players, update]);
});
