'use client'

import { BuilderProvider } from '@/lib/builder-context'
import { BuilderNav } from './builder-nav'
import { FieldSidebar } from './field-sidebar'
import { Canvas } from './canvas'
import { SettingsPanel } from './settings-panel'
import type { BuilderState } from '@/lib/builder-types'

export function BuilderShell({ initialState }: { initialState: BuilderState }) {
  return (
    <BuilderProvider initialState={initialState}>
      <div className="flex h-dvh flex-col overflow-hidden">
        <BuilderNav />
        <div className="grid flex-1 grid-cols-[260px_1fr_300px] overflow-hidden max-lg:grid-cols-[220px_1fr_260px] max-md:grid-cols-1">
          <FieldSidebar />
          <Canvas />
          <SettingsPanel />
        </div>
      </div>
    </BuilderProvider>
  )
}
