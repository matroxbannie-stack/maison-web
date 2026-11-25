import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center px-5 py-40 text-center lg:px-10">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Error 404</p>
      <h1 className="mt-4 font-heading text-5xl font-semibold tracking-tight lg:text-7xl">Page not found</h1>
      <p className="mt-5 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 items-center bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        Back to home
      </Link>
    </div>
  )
}