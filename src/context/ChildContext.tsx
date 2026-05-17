"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Child } from "@/types";

interface ChildContextValue {
  child: Child;
}

const ChildContext = createContext<ChildContextValue | null>(null);

export function ChildProvider({
  child,
  children,
}: {
  child: Child;
  children: ReactNode;
}) {
  return (
    <ChildContext.Provider value={{ child }}>
      {children}
    </ChildContext.Provider>
  );
}

/** Returns the active child. Must be used inside a [childId] route. */
export function useChild(): Child {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChild must be used inside <ChildProvider>");
  return ctx.child;
}
