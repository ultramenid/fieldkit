import Link from 'next/link'

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[520px] px-6 pb-[60px] pt-[80px] text-center max-sm:pb-10 max-sm:pt-12">
      <h1 className="mb-4 font-sans text-[42px] font-medium leading-[1.1] tracking-tight text-[var(--foreground)] max-sm:text-[32px]">
        Build forms online, collect data anywhere
      </h1>
      <p className="mx-auto mb-8 max-w-[48ch] text-[17px] text-[var(--muted)]">
        Create rich forms in the cloud, deploy them to local networks for offline data collection. Built for NGOs and field teams.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-[15px] font-medium text-[var(--background)] transition-colors hover:opacity-80"
        >
          Get started
        </Link>
      </div>
    </section>
  )
}
