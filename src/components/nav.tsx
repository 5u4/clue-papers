import React, { type PropsWithChildren } from "react";
import Link from "next/link";

import { Button } from "~/components/ui/button";

interface Props {
  noHomeBtn?: boolean | undefined;
}

export const Nav: React.FC<PropsWithChildren<Props>> = ({
  children,
  noHomeBtn,
}) => {
  return (
    <div className="pb-4">
      <div className="grid grid-cols-4">
        {noHomeBtn ? (
          <div />
        ) : (
          <Link href="/">
            <Button variant="link" className="px-0">
              🔍 Clue Paper
            </Button>
          </Link>
        )}

        <div className="col-span-2 flex justify-center items-center">
          {children}
        </div>
      </div>
    </div>
  );
};
