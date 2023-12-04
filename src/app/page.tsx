import Link from "next/link";

import { GameList } from "~/app/games/game-list";
import { ClientOnly } from "~/components/client-only";
import { H1 } from "~/components/h1";
import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <Nav noHomeBtn>
        <H1>🔍 Clue Paper</H1>
      </Nav>

      <div className="flex flex-col space-y-4">
        <Link href="/games/new">
          <Button className="w-full">New Game</Button>
        </Link>

        <ClientOnly>
          <GameList />
        </ClientOnly>
      </div>
    </>
  );
}
