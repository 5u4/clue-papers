"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const GAME_PLAYERS_KEY = "p";

export const useNewGame = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const names = useMemo(() => {
    const raw = searchParams.get(GAME_PLAYERS_KEY);
    try {
      return z.array(z.string()).parse(JSON.parse(raw ?? "[]"));
    } catch (e) {
      return [];
    }
  }, [searchParams]);

  const setNames = (names: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(GAME_PLAYERS_KEY, JSON.stringify(names));
    router.push("/games/new?" + newParams.toString());
  };

  return { names, setNames };
};
