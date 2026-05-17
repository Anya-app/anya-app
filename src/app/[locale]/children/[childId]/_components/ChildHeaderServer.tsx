/**
 * Server component wrapper — receives child as a plain prop
 * (avoids "use client" context in a Server Component layout).
 * It renders the CLIENT ChildHeader which reads from ChildContext.
 */
import type { Child } from "@/types";
import ChildHeaderClient from "@/components/layout/ChildHeader";

// The client component imports useChild() from context;
// ChildProvider in the layout sets that context.
// We just render the client component here.
export default function ChildHeaderServer({ child }: { child: Child }) {
  // child prop unused here — ChildHeader reads from ChildContext.
  // We include it so this server component can in the future
  // generate og-image metadata etc. without re-fetching.
  return <ChildHeaderClient />;
}
