import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cluesWhat, cluesWhere, cluesWho } from "~/data/clues";
import { addGameTurnActionAtom, gamesReadOnlyAtom } from "~/data/games-store";

const formSchema = z.object({
  who: z.string({ required_error: "Required" }).min(1),
  what: z.string({ required_error: "Required" }).min(1),
  where: z.string({ required_error: "Required" }).min(1),
  disprovedBy: z.string().optional(),
  disprovedWith: z.string().optional(),
});

interface Props {
  id: string;
  player: string;
  onMakeSuggestion: (f: z.infer<typeof formSchema>) => void;
}

export const GameSuggestionForm: React.FC<Props> = ({
  id,
  player,
  onMakeSuggestion,
}) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const addGameTurn = useSetAtom(addGameTurnActionAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = form.handleSubmit((values) => {
    addGameTurn({
      id,
      turn: {
        type: "suggestion",
        player,
        suggestions: [values.who, values.what, values.where],
        disproved: values.disprovedBy
          ? {
              player: values.disprovedBy,
              clue:
                player === game.players.at(0)
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cluesWho.map((clue) => (
                    <SelectItem key={clue} value={clue}>
                      {clue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="what"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select what" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cluesWhat.map((clue) => (
                    <SelectItem key={clue} value={clue}>
                      {clue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="where"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select where" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cluesWhere.map((clue) => (
                    <SelectItem key={clue} value={clue}>
                      {clue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select disprover" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {game.players
                    .filter((p) => p !== player)
                    .map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={
                      !form.getValues().disprovedBy ||
                      player !== game.players.at(0)
                    }
                  >
                    <SelectValue placeholder="Select disprover" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    form.getValues().who,
                    form.getValues().what,
                    form.getValues().where,
                  ].map((clue) => (
                    <SelectItem key={clue} value={clue}>
                      {clue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Leave empty if you don&apos;t know the disproved clue.
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