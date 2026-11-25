export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-10 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
        <div className="aspect-[4/5] animate-pulse bg-muted" />
        <div>
          <div className="h-3 w-40 animate-pulse bg-muted" />
          <div className="mt-8 h-12 w-3/4 animate-pulse bg-muted" />
          <div className="mt-5 h-5 w-24 animate-pulse bg-muted" />
          <div className="mt-12 h-10 w-full animate-pulse bg-muted" />
          <div className="mt-6 h-14 w-full animate-pulse bg-muted" />
        </div>
      </div>
    </div>
  )
}