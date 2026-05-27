import type { MDXComponents } from 'mdx/types'
import type { ReactNode } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'

const themeComponents = getThemeComponents()

export function useMDXComponents(components: MDXComponents) {
  return {
    ...themeComponents,
    Callout: ({ type = 'info', children }: { type?: string; children: ReactNode }) => (
      <div className="callout" data-type={type}>
        <div className="callout-body">{children}</div>
      </div>
    ),
    Steps: ({ children }: { children: ReactNode }) => (
      <div className="steps">{children}</div>
    ),
    Step: ({ num, title, children }: { num: number; title: string; children: ReactNode }) => (
      <div className="step">
        <div className="step-num">{num}</div>
        <div className="step-body">
          <h3>{title}</h3>
          {children}
        </div>
      </div>
    ),
    ...components,
  }
}
