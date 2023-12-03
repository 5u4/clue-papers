"use client";

import React, { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai/react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { addPlayerActionAtom, playersReadOnlyAtom } from "~/data/players-store";
import { notEmpty } from "~/utils/not-empty";
import { cn } from "~/utils/ui";

interface Props {
  selectedPlayerNames: string[];
  onAddPlayerName: (name: string) => void;
}

export const AddPlayerButton: React.FC<Props> = ({
  selectedPlayerNames,
  onAddPlayerName,
}) => {
  const players = useAtomValue(playersReadOnlyAtom);
  const addPlayer = useSetAtom(addPlayerActionAtom);

  const [name, setName] = useState<string>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>();

  const onAddPlayer = (name: string) => {
    if (players.every((p) => p.name !== name)) {
      addPlayer({ name: name });
    }
    onAddPlayerName(name);
    setName("");
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="name">Player Name</Label>
      <div className="flex flex-row space-x-2 items-center justify-between">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {name ? <>{name}</> : <>+ Player</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Type in player name"
                value={text}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                onInput={(e) => setText((e.target as any).value)}
              />
              <CommandList>
                <CommandGroup>
                  {[
                    players.some((p) => p.name === text)
                      ? undefined
                      : { name: text },
                    ...players,
                  ]
                    .filter(notEmpty)
                    .map((player) => (
                      <CommandItem
                        className={cn(
                          selectedPlayerNames.some((p) => p === player.name) &&
                            "opacity-30",
                        )}
                        key={player.name ?? ""}
                        value={player.name}
                        onSelect={(value) => {
                          if (players.some((p) => p.name === value)) {
                            /** directly add to list if is known player */
                            onAddPlayer(value);
                          } else {
                            /** wait for user to confirm add player if is new player */
                            setName(value);
                          }
                          setText("");
                          setOpen(false);
                        }}
                        disabled={selectedPlayerNames.some(
                          (p) => p === player.name,
                        )}
                      >
                        {player.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          disabled={!name || selectedPlayerNames.some((p) => p === name)}
          onClick={() => onAddPlayer(name!)}
        >
          Add Player
        </Button>
      </div>
    </div>
  );
};
