import React, { useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai/react";

import { GameAccusationForm } from "~/app/games/[id]/game-accusation-form";
import { GameNoActionForm } from "~/app/games/[id]/game-no-action-form";
import { GameSuggestionForm } from "~/app/games/[id]/game-suggestion-form";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { gamesReadOnlyAtom } from "~/data/games-store";
import { cn } from "~/utils/ui";

interface Props {
  id: string;
}

export const GameNextActionSheet: React.FC<Props> = ({ id }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const [sheetOpen, _setSheetOpen] = useState(false);
  const setSheetOpen = (v: boolean) => {
    const pid = (() => {
      const lastPlayerId = game.turns.at(-1)?.playerId;
      if (!lastPlayerId) return null;
      const lastPlayerIdx = game.players.findIndex(
        (p) => p.id === lastPlayerId,
      );
      return (
        game.players.at((lastPlayerIdx + 1) % game.players.length)?.id ?? null
      );
    })();

    setPlayerId(pid);
    _setSheetOpen(v);
  };
  const [cmdOpen, setCmdOpen] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="w-full"
          disabled={game.turns.some(
            (turn) => turn.type === "accusation" && turn.success,
          )}
        >
          Next
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <div className="mx-auto max-w-xl flex flex-col space-y-4">
          <SheetHeader>
            <SheetTitle>Input next player actions</SheetTitle>
          </SheetHeader>

          <Label>Player</Label>
          <Popover open={cmdOpen} onOpenChange={setCmdOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cmdOpen}
                className="w-[200px] justify-between"
              >
                {playerId
                  ? game.players.find((player) => player.id === playerId)?.name
                  : "Select player..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search player..." className="h-9" />
                <CommandEmpty>No player found.</CommandEmpty>
                <CommandGroup>
                  {game.players.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={player.name}
                      onSelect={(currentValue) => {
                        setPlayerId(
                          currentValue === player.id ? null : player.id,
                        );
                        setCmdOpen(false);
                      }}
                    >
                      {player.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          playerId === player.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div className={cn(playerId ?? "hidden")}>
            <Tabs defaultValue="suggestion">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
                <TabsTrigger value="idle">No Action</TabsTrigger>
                <TabsTrigger value="accusation">Accusation</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestion">
                <GameSuggestionForm
                  id={id}
                  playerId={playerId!}
                  onMakeSuggestion={() => setSheetOpen(false)}
                />
              </TabsContent>
              <TabsContent value="idle">
                <GameNoActionForm
                  id={id}
                  playerId={playerId!}
                  onMakeIdle={() => setSheetOpen(false)}
                />
              </TabsContent>
              <TabsContent value="accusation">
                <GameAccusationForm
                  id={id}
                  playerId={playerId!}
                  onMakeAccusation={() => setSheetOpen(false)}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  );
};
