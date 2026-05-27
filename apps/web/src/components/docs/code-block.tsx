'use client'

interface CodeBlockProps {
  children: string
  language?: string
}

export function CodeBlock({ children, language = 'bash' }: CodeBlockProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-500">{language}</span>
      </div>
      
      {/* Code */}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm text-gray-100 font-mono leading-relaxed">
          {children}
        </code>
      </pre>
    </div>
  )
}
