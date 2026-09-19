/**
 * Fixed aurora blobs + grain overlay.
 * Pure CSS, zero JS — original design ka signature background.
 */
export function Aurora() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed -left-[18vw] -top-[22vw] z-0 h-[70vw] max-h-[750px] w-[70vw] max-w-[750px] rounded-full opacity-[0.42] blur-[90px] will-change-transform animate-(--animate-drift-1)"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(124,58,237,.85), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-[20vw] -right-[16vw] z-0 h-[60vw] max-h-[640px] w-[60vw] max-w-[640px] rounded-full opacity-[0.42] blur-[90px] will-change-transform animate-(--animate-drift-2)"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(8,145,178,.7), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[56%] top-[38%] z-0 h-[44vw] max-h-[480px] w-[44vw] max-w-[480px] rounded-full opacity-30 blur-[90px] will-change-transform animate-(--animate-drift-3)"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(236,72,153,.45), transparent 60%)",
        }}
      />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-0 opacity-50" />
    </>
  );
}
