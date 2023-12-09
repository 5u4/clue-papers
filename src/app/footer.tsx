import React from "react";
import Link from "next/link";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

import { Button } from "~/components/ui/button";

export const Footer: React.FC = () => {
  return (
    <footer className="text-center border-t pt-2">
      <Link href="https://github.com/5u4/clue-papers" target="_blank">
        <Button variant="link" className="text-muted-foreground" size="sm">
          Source Code <ExternalLinkIcon className="ml-1" />
        </Button>
      </Link>
    </footer>
  );
};
