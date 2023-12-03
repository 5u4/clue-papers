import Link from "next/link";

import { H1 } from "~/components/h1";

export default function Home() {
  return (
    <>
      <H1 className="text-center">Clue Paper</H1>
      <Link href="/games/new">new</Link>
    </>
  );
}
