import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";

const playersAtom = atomWithStorage<string[]>("players", [], undefined, {
  getOnInit: true,
});

export const playersReadOnlyAtom = atom((get) => get(playersAtom));

export const addPlayerActionAtom = atom(null, (get, set, name: string) => {
  const players = get(playersReadOnlyAtom);
  if (players.some((p) => p === name)) {
    throw new Error(`player name is taken ${name}`);
  }
  set(playersAtom, [...players, name]);
});
