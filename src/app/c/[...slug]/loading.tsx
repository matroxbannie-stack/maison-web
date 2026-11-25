export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 py-12 lg:px-10">
      <div className="h-3 w-32 animate-pulse bg-muted" />
      <div className="mt-8 h-16 w-72 animate-pulse bg-muted" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse bg-muted" />
      <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse bg-muted" />
            <div className="mt-4 h-4 w-3/4 animate-pulse bg-muted" />
            <div className="mt-2 h-3 w-1/3 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}