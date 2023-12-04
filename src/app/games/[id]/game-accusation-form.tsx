import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
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

interface Props {
  id: string;
  player: string;
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
  player,
  onMakeAccusation,
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
        type: "accusation",
        player,
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
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Result</FormLabel>
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
