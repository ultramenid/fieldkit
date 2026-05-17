import Link from 'next/link'

interface ScreenCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  tag: string
  tagVariant: 'server' | 'local'
}

export function ScreenCard({ href, icon, title, description, tag, tagVariant }: ScreenCardProps) {
  const tagClass =
    tagVariant === 'server'
      ? 'text-[#16a34a] border-[#bbf7d0]'
      : 'text-[#b45309] border-[#fde68a]'

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-[12px] border border-neutral-200 p-6 text-black no-underline transition-colors hover:border-black"
    >
      <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-neutral-200 bg-[#fafafa]">
        <span className="text-neutral-500 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <h3 className="m-0 text-base font-medium">{title}</h3>
      <p className="m-0 text-[13px] text-neutral-500">{description}</p>
      <span className={`self-start rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${tagClass}`}>
        {tag}
      </span>
    </Link>
  )
}
