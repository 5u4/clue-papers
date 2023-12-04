import React, { useState } from "react";
import { useAtomValue } from "jotai/react";

import { GameAccusationForm } from "~/app/games/[id]/game-accusation-form";
import { GameNoActionForm } from "~/app/games/[id]/game-no-action-form";
import { GameSuggestionForm } from "~/app/games/[id]/game-suggestion-form";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
      const lastPlayer = game.turns.at(-1)?.player;
      if (!lastPlayer) return null;
      const lastPlayerIdx = game.players.findIndex((p) => p === lastPlayer);
      return game.players.at((lastPlayerIdx + 1) % game.players.length) ?? null;
    })();

    setPlayer(pid);
    _setSheetOpen(v);
  };
  const [player, setPlayer] = useState<string | null>(null);

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
          <Select value={player ?? undefined} onValueChange={setPlayer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {game.players.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className={cn(player ?? "hidden")}>
            <Tabs defaultValue="suggestion">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
                <TabsTrigger value="idle">No Action</TabsTrigger>
                <TabsTrigger value="accusation">Accusation</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestion">
                <GameSuggestionForm
                  id={id}
                  player={player!}
                  onMakeSuggestion={() => setSheetOpen(false)}
                />
              </TabsContent>
              <TabsContent value="idle">
                <GameNoActionForm
                  id={id}
                  player={player!}
                  onMakeIdle={() => setSheetOpen(false)}
                />
              </TabsContent>
              <TabsContent value="accusation">
                <GameAccusationForm
                  id={id}
                  player={player!}
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
