"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cluesWhat, cluesWhere, cluesWho } from "~/data/clues";

interface Props {
  id: string;
  onSetInitialClues: (clueIds: string[]) => void;
}

const formSchema = z.object({
  items: z.array(z.string()),
});

export const SetInitialCluesForm: React.FC<Props> = ({ onSetInitialClues }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [] },
  });

  const onSubmit = form.handleSubmit((values) => {
    onSetInitialClues(values.items);
  });

  return (
    <div className="p-2 grid place-items-center">
      <div className="max-w-xl w-full">
        <h2 className="pb-2 text-center text-sm text-muted-foreground">
          Select the initial clues you have
        </h2>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <div className="flex justify-between space-x-6">
                  {Object.entries({
                    who: cluesWho,
                    what: cluesWhat,
                    where: cluesWhere,
                  }).map(([type, items]) => (
                    <FormItem key={type}>
                      <div className="mb-4">
                        <FormLabel className="text-base capitalize">
                          {type}
                        </FormLabel>
                      </div>
                      {items.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="items"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
              )}
            />

            <Button type="submit" className="w-full">
              Start Game
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
