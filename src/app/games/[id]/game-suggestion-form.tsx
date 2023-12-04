import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { clues } from "~/data/clues";
import { addGameTurnActionAtom, gamesReadOnlyAtom } from "~/data/games-store";
import { cn } from "~/utils/ui";

const formSchema = z.object({
  who: z.string({ required_error: "Required" }).min(1),
  what: z.string({ required_error: "Required" }).min(1),
  where: z.string({ required_error: "Required" }).min(1),
  disprovedBy: z.string().optional(),
  disprovedWith: z.string().optional(),
});

interface Props {
  id: string;
  playerId: string;
  onMakeSuggestion: (f: z.infer<typeof formSchema>) => void;
}

export const GameSuggestionForm: React.FC<Props> = ({
  id,
  playerId,
  onMakeSuggestion,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const addGameTurn = useSetAtom(addGameTurnActionAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [whoOpen, setWhoOpen] = useState(false);
  const [whatOpen, setWhatOpen] = useState(false);
  const [whereOpen, setWhereOpen] = useState(false);
  const [disprovedByOpen, setDisprovedByOpen] = useState(false);
  const [disprovedWithOpen, setDisprovedWithOpen] = useState(false);

  const onSubmit = form.handleSubmit((values) => {
    addGameTurn({
      id,
      turn: {
        type: "suggestion",
        playerId,
        suggestions: [values.who, values.what, values.where],
        disproved: values.disprovedBy
          ? {
              player: values.disprovedBy,
              clue:
                playerId === game.players.at(0)?.id
                  ? values.disprovedWith ?? null
                  : null,
            }
          : null,
        createdAt: new Date(),
      },
    });
    onMakeSuggestion(values);
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="who"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Suggested Clues</FormLabel>
              <Popover open={whoOpen} onOpenChange={setWhoOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? clues.who.find((clue) => clue.full === field.value)
                            ?.full
                        : "Select who"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search clue..."
                      className="h-9"
                    />
                    <CommandEmpty>No clue found.</CommandEmpty>
                    <CommandGroup>
                      {clues.who.map((clue) => (
                        <CommandItem
                          value={clue.full}
                          key={clue.full}
                          onSelect={() => {
                            form.setValue("who", clue.full);
                            setWhoOpen(false);
                          }}
                        >
                          {clue.full}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              clue.full === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="what"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={whatOpen} onOpenChange={setWhatOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? clues.what.find((clue) => clue.full === field.value)
                            ?.full
                        : "Select what"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search clue..."
                      className="h-9"
                    />
                    <CommandEmpty>No clue found.</CommandEmpty>
                    <CommandGroup>
                      {clues.what.map((clue) => (
                        <CommandItem
                          value={clue.full}
                          key={clue.full}
                          onSelect={() => {
                            form.setValue("what", clue.full);
                            setWhatOpen(false);
                          }}
                        >
                          {clue.full}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              clue.full === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="where"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={whereOpen} onOpenChange={setWhereOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? clues.where.find((clue) => clue.full === field.value)
                            ?.full
                        : "Select where"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search clue..."
                      className="h-9"
                    />
                    <CommandEmpty>No clue found.</CommandEmpty>
                    <CommandGroup>
                      {clues.where.map((clue) => (
                        <CommandItem
                          value={clue.full}
                          key={clue.full}
                          onSelect={() => {
                            form.setValue("where", clue.full);
                            setWhereOpen(false);
                          }}
                        >
                          {clue.full}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              clue.full === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disprovedBy"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Disproves</FormLabel>
              <Popover open={disprovedByOpen} onOpenChange={setDisprovedByOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? game.players.find(
                            (player) => player.id === field.value,
                          )?.name
                        : "Select disprover"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search player..."
                      className="h-9"
                    />
                    <CommandEmpty>No player found.</CommandEmpty>
                    <CommandGroup>
                      {game.players
                        .filter((player) => player.id !== playerId)
                        .map((player) => (
                          <CommandItem
                            value={player.id}
                            key={player.id}
                            onSelect={() => {
                              form.setValue(
                                "disprovedBy",
                                player.id === form.getValues().disprovedBy
                                  ? undefined
                                  : player.id,
                              );
                              setDisprovedByOpen(false);
                            }}
                          >
                            {player.name}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                player.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Leave empty if no one disproves.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disprovedWith"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover
                open={disprovedWithOpen}
                onOpenChange={setDisprovedWithOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={
                        !form.getValues().disprovedBy ||
                        playerId !== game.players.at(0)?.id
                      }
                    >
                      {field.value
                        ? [
                            form.getValues().who,
                            form.getValues().what,
                            form.getValues().where,
                          ].find((clueId) => clueId === field.value)
                        : "Select disproved clue"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search clue..."
                      className="h-9"
                    />
                    <CommandEmpty>No clue found.</CommandEmpty>
                    <CommandGroup>
                      {[
                        form.getValues().who,
                        form.getValues().what,
                        form.getValues().where,
                      ].map((clueId) => (
                        <CommandItem
                          value={clueId}
                          key={clueId}
                          onSelect={() => {
                            form.setValue(
                              "disprovedWith",
                              clueId === form.getValues().disprovedWith
                                ? undefined
                                : clueId,
                            );
                            setDisprovedWithOpen(false);
                          }}
                        >
                          {clueId}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              clueId === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Leave empty if you don't know the disproved clue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Continue
        </Button>
      </form>
    </Form>
  );
};
