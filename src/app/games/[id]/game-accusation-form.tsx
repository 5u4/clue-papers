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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { clues } from "~/data/clues";
import { addGameTurnActionAtom, gamesReadOnlyAtom } from "~/data/games-store";
import { cn } from "~/utils/ui";

interface Props {
  id: string;
  playerId: string;
  onMakeAccusation: () => void;
}

const formSchema = z.object({
  who: z.string({ required_error: "Required" }).min(1),
  what: z.string({ required_error: "Required" }).min(1),
  where: z.string({ required_error: "Required" }).min(1),
  result: z.union([z.literal("success"), z.literal("failed")]),
});

export const GameAccusationForm: React.FC<Props> = ({
  id,
  playerId,
  onMakeAccusation,
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

  const onSubmit = form.handleSubmit((values) => {
    addGameTurn({
      id,
      turn: {
        type: "accusation",
        playerId,
        accusations: [values.who, values.what, values.where],
        success: values.result === "success",
        createdAt: new Date(),
      },
    });
    onMakeAccusation();
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="who"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Accusations</FormLabel>
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
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
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
