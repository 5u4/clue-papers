"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CopyIcon,
  DotsVerticalIcon,
  ResumeIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai/react";
import TimeAgo from "timeago-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { deleteGameActionAtom, gamesReadOnlyAtom } from "~/data/games-store";
import { useNewGame } from "~/data/use-new-game";

export const GameList: React.FC = () => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const router = useRouter();
  const deleteGame = useSetAtom(deleteGameActionAtom);

  return (
    <div className="flex flex-col space-y-2">
      {games.length === 0 && (
        <div className="text-muted-foreground px-2 py-8 text-sm w-full border rounded-md text-center">
          No game yet.
        </div>
      )}

      {games
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .map((game) => (
          <React.Fragment key={game.id}>
            <div className="border rounded-md shadow-sm w-full pl-4 pr-3 py-3">
              <div className="flex flex-row justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{game.id}</p>
                  <div>
                    <span className="text-muted-foreground">Players: </span>
                    {game.players.join(", ")}
                  </div>
                  <TimeAgo
                    className="text-sm text-muted-foreground"
                    datetime={game.createdAt}
                  />
                </div>
                <div>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <DotsVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => router.push(`/games/${game.id}`)}
                          >
                            <ResumeIcon className="mr-2" />
                            Continue
                          </DropdownMenuItem>
                          <CloneGameDropDownItem id={game.id} />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                              <TrashIcon className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Do you want to delete game {game.id}?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => deleteGame(game.id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
    </div>
  );
};

const CloneGameDropDownItem: React.FC<{ id: string }> = ({ id }) => {
  const games = useAtomValue(gamesReadOnlyAtom);
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`cannot find game ${id}`);

  const { setNames } = useNewGame();

  return (
    <DropdownMenuItem onClick={() => setNames(game.players)}>
      <CopyIcon className="mr-2" />
      Clone
    </DropdownMenuItem>
  );
};
