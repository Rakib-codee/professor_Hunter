// Route transition (DESIGN.md §9): the new page fades in over 180ms, opacity only, no layout
// shift. Re-mounts on every navigation, unlike a layout. Reduced motion makes it instant.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="enter-fade flex flex-1 flex-col">{children}</div>;
}
