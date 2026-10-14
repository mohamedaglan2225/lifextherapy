/** Shown on every page while an admin is previewing drafts. */
export function PreviewBar() {
  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-[70] flex items-center gap-3 rounded-sm bg-charcoal px-4 py-3 text-xs text-offwhite shadow-lg md:bottom-4"
    >
      <span className="font-semibold uppercase tracking-[0.15em] text-bronze">Preview</span>
      <span className="hidden sm:inline">You are viewing unpublished drafts.</span>
      <form action="/api/preview/exit" method="post">
        <button type="submit" className="font-semibold underline underline-offset-4">
          Exit preview
        </button>
      </form>
    </div>
  )
}
