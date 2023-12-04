"use client";

import React, { useState } from "react";
import { useAtomValue } from "jotai/react";

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
import { playersReadOnlyAtom } from "~/data/players-store";
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

  const [name, setName] = useState<string>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>();

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="name">Player Name</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={selectedPlayerNames.length >= 6}
          >
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
                  players.some((p) => p === text) ? undefined : text,
                  ...players,
                ]
                  .filter(notEmpty)
                  .map((player) => (
                    <CommandItem
                      className={cn(
                        selectedPlayerNames.some((p) => p === player) &&
                          "opacity-30",
                      )}
                      key={player ?? ""}
                      value={player}
                      onSelect={(value) => {
                        onAddPlayerName(value);
                        setName("");
                        setText("");
                        setOpen(false);
                      }}
                      disabled={selectedPlayerNames.some((p) => p === player)}
                    >
                      {player}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
