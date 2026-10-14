export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <div className="h-9 w-64 animate-pulse rounded-sm bg-ivory-dark" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-sm bg-ivory-dark" />
      <div className="mt-6 h-40 animate-pulse rounded-sm bg-ivory-dark" />
      <div className="h-40 animate-pulse rounded-sm bg-ivory-dark" />
    </div>
  )
}
