import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { nanoid } from "nanoid";
import { z } from "zod";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Player = z.infer<typeof playerSchema>;

const playersAtom = atomWithStorage<Player[]>("players", [], undefined, {
  getOnInit: true,
});

export const playersReadOnlyAtom = atom((get) => get(playersAtom));

const addPlayerPropsSchema = playerSchema.pick({ name: true });
export const addPlayerActionAtom = atom(
  null,
  (get, set, props: z.infer<typeof addPlayerPropsSchema>) => {
    props = addPlayerPropsSchema.parse(props);
    const players = get(playersReadOnlyAtom);
    if (players.some((p) => p.name === props.name)) {
      throw new Error(`player name is taken ${JSON.stringify(props)}`);
    }
    set(playersAtom, [...players, { id: nanoid(), ...props }]);
  },
);
