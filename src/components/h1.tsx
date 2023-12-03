import React from "react";

import { cn } from "~/utils/ui";

export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      className,
    )}
    {...props}
  ></h1>
));
H1.displayName = "H1";
