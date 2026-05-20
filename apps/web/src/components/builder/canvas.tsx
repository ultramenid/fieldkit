'use client'

import { useRef, useEffect } from 'react'
import { useBuilder } from '@/lib/builder-context'
import { DescriptionRichEditor } from './description-rich-editor'
import { FieldItem } from './field-item'

const DRAG_THRESHOLD = 5

export function Canvas() {
  const { state, dispatch } = useBuilder()
  const fieldsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const dragState = useRef<{
    el: HTMLElement
    ghost: HTMLElement
    placeholder: HTMLElement
    fromIndex: number
    offsetX: number
    offsetY: number
  } | null>(null)

  // Set initial content once on mount — never update via React to avoid cursor jumping
  useEffect(() => {
    if (titleRef.current && !titleRef.current.textContent) {
      titleRef.current.textContent = state.title
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, fieldId: string) {
    if ((e.target as HTMLElement).closest('input, select, textarea, button, [contenteditable="true"]')) return
    const el = (e.currentTarget as HTMLElement)
    const rect = el.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    let dragging = false

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!dragging && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
        dragging = true
        startDrag(el, rect, startX, startY, fieldId)
      }
      if (dragging) moveDrag(ev)
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      if (dragging) endDrag()
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  function startDrag(el: HTMLElement, rect: DOMRect, _sx: number, _sy: number, fieldId: string) {
    const container = fieldsRef.current!
    const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-field-id]'))
    const fromIndex = fields.findIndex((f) => f.dataset.fieldId === fieldId)

    const ghost = el.cloneNode(true) as HTMLElement
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;opacity:0.9;width:${rect.width}px;left:${rect.left}px;top:${rect.top}px;transform:rotate(1deg) scale(1.02);border:2px solid var(--foreground);border-radius:12px;background:var(--background);`
    document.body.appendChild(ghost)
    document.body.style.userSelect = 'none'

    const placeholder = document.createElement('div')
    placeholder.style.cssText = `height:${rect.height}px;border:2px dashed var(--accent);border-radius:12px;background:color-mix(in oklch,var(--accent) 14%,transparent);pointer-events:none;`
    el.style.opacity = '0'
    container.insertBefore(placeholder, el.nextSibling)

    dragState.current = {
      el,
      ghost,
      placeholder,
      fromIndex,
      offsetX: 0,
      offsetY: 0,
    }
  }

  function moveDrag(e: PointerEvent) {
    const ds = dragState.current
    if (!ds) return
    const container = fieldsRef.current!
    const containerRect = container.getBoundingClientRect()

    ds.ghost.style.left = (e.clientX - containerRect.width / 2) + 'px'
    ds.ghost.style.top = e.clientY - 30 + 'px'

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-field-id]')
    ).filter((el) => el !== ds.el)

    let insertBefore: HTMLElement | null = null
    for (const item of items) {
      const r = item.getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) {
        insertBefore = item
        break
      }
    }

    if (insertBefore) {
      if (ds.placeholder.nextSibling !== insertBefore) {
        container.insertBefore(ds.placeholder, insertBefore)
      }
    } else {
      if (ds.placeholder !== container.lastElementChild) {
        container.appendChild(ds.placeholder)
      }
    }
  }

  function endDrag() {
    const ds = dragState.current
    if (!ds) return
    const container = fieldsRef.current!

    const allItems = Array.from(container.querySelectorAll<HTMLElement>('[data-field-id]'))
    const placeholderIndex = Array.from(container.children).indexOf(ds.placeholder)
    const itemsBefore = Array.from(container.children)
      .slice(0, placeholderIndex)
      .filter((el) => el.hasAttribute('data-field-id')).length
    const toIndex = itemsBefore

    container.insertBefore(ds.el, ds.placeholder)
    ds.el.style.opacity = ''
    ds.placeholder.remove()
    ds.ghost.remove()
    document.body.style.userSelect = ''
    dragState.current = null

    if (ds.fromIndex !== toIndex) {
      dispatch({ type: 'REORDER_FIELDS', fromIndex: ds.fromIndex, toIndex })
    }
  }

  return (
    <main
      className="flex flex-col items-center overflow-y-auto bg-[var(--surface)] p-10"
      onClick={(e) => {
        // Deselect field when clicking outside the form card
        if (e.target === e.currentTarget) {
          dispatch({ type: 'SELECT_FIELD', id: null })
        }
      }}
    >
      <div className="w-full max-w-[540px] rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-10">
        {/* Form header */}
        <div className="mb-8 border-b border-[var(--border)] pb-6">
          <h2
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={(e) =>
              dispatch({ type: 'SET_TITLE', title: (e.target as HTMLElement).textContent ?? '' })
            }
            className="mb-2 -ml-2 rounded-[6px] border border-transparent px-2 py-1 font-[family-name:var(--font-display)] text-[24px] font-medium text-[var(--foreground)] outline-none transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)] focus:border-[var(--foreground)] focus:bg-[var(--surface)]"
          ></h2>
          <DescriptionRichEditor
            key="description-editor"
            value={state.description}
            onChange={(description) => dispatch({ type: 'SET_DESCRIPTION', description })}
          />
        </div>

        {/* Fields */}
        <div ref={fieldsRef} className="flex flex-col gap-1">
          {state.fields.map((field) => (
            <FieldItem
              key={field.id}
              field={field}
              isSelected={state.selectedId === field.id}
              onSelect={() => dispatch({ type: 'SELECT_FIELD', id: field.id })}
              onPointerDown={(e) => handlePointerDown(e, field.id)}
            />
          ))}
        </div>

        {/* Empty state */}
        {state.fields.length === 0 && (
          <div className="py-16 text-center text-[15px] text-[var(--muted)]">
            Click a field type on the left to start building your form
          </div>
        )}
      </div>
    </main>
  )
}
