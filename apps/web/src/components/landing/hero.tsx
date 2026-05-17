import Link from 'next/link'

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[520px] px-6 pb-[60px] pt-[80px] text-center max-sm:pb-10 max-sm:pt-12">
      <h1 className="mb-4 font-sans text-[42px] font-medium leading-[1.1] tracking-tight max-sm:text-[32px]">
        Build forms online, collect data anywhere
      </h1>
      <p className="mx-auto mb-8 max-w-[48ch] text-[17px] text-neutral-500">
        Create rich forms in the cloud, deploy them to local networks for offline data collection. Built for NGOs and field teams.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Get started
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[15px] font-medium text-black transition-colors hover:border-black"
        >
          Documentation
        </Link>
      </div>
    </section>
  )
}
