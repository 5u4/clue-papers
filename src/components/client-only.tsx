"use client";

import React, { type PropsWithChildren, useEffect, useState } from "react";

export const ClientOnly: React.FC<PropsWithChildren> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <></>;
  return <>{children}</>;
};
