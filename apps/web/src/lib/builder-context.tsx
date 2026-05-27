'use client'

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { DEFAULT_FIELD_RICH_TEXT_FEATURES } from '@fieldkit/form-schema'
import type { BuilderState, BuilderAction, BuilderField } from './builder-types'
import { DEFAULT_LABELS, DEFAULT_OPTIONS } from './builder-types'
import { sanitizeRichTextHtml, normalizePlainDescriptionToHtml } from './sanitize-rich-text'

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const hasOptions = ['select', 'radio', 'checkbox'].includes(action.fieldType)
      const isRichtext = action.fieldType === 'richtext'
      const newField: BuilderField = {
        id: crypto.randomUUID(),
        type: action.fieldType,
        label: DEFAULT_LABELS[action.fieldType],
        required: false,
        ...(isRichtext
          ? {
              placeholder: 'Write your answer…',
              editorFeatures: { ...DEFAULT_FIELD_RICH_TEXT_FEATURES },
            }
          : {}),
        ...(hasOptions ? { options: [...DEFAULT_OPTIONS] } : {}),
      }
      return {
        ...state,
        fields: [...state.fields, newField],
        selectedId: newField.id,
        isDirty: true,
        saveGeneration: state.saveGeneration + 1,
      }
    }
    case 'SELECT_FIELD':
      return { ...state, selectedId: action.id }
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map((f) => (f.id === action.id ? { ...f, ...action.patch } : f)),
        isDirty: true,
        saveGeneration: state.saveGeneration + 1,
      }
    case 'REORDER_FIELDS': {
      const fields = [...state.fields]
      const [moved] = fields.splice(action.fromIndex, 1)
      fields.splice(action.toIndex, 0, moved)
      return { ...state, fields, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    }
    case 'DELETE_FIELD': {
      const fields = state.fields.filter((f) => f.id !== action.id)
      return {
        ...state,
        fields,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        isDirty: true,
        saveGeneration: state.saveGeneration + 1,
      }
    }
    case 'SET_TITLE':
      return { ...state, title: action.title, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    case 'SET_DESCRIPTION':
      return { ...state, description: action.description, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }
    case 'MARK_CLEAN':
      return { ...state, isDirty: false, isSaving: false }
    case 'SET_PUBLISHED':
      return { ...state, isPublished: action.isPublished, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    case 'SET_CLOSED':
      return { ...state, isClosed: action.isClosed, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    case 'SET_ALLOW_MULTIPLE':
      return { ...state, allowMultipleSubmissions: action.allowMultipleSubmissions, isDirty: true, saveGeneration: state.saveGeneration + 1 }
    case 'SET_VERSION':
      return { ...state, version: action.version }
    default:
      return state
  }
}

interface BuilderContextValue {
  state: BuilderState
  dispatch: React.Dispatch<BuilderAction>
  save: () => Promise<void>
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function BuilderProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: BuilderState
}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const save = useCallback(async () => {
    const s = stateRef.current
    const capturedGeneration = s.saveGeneration
    const descriptionHtml = s.description.trim().startsWith('<')
      ? sanitizeRichTextHtml(s.description)
      : sanitizeRichTextHtml(normalizePlainDescriptionToHtml(s.description))
    const fields = s.fields
    dispatch({ type: 'SET_SAVING', isSaving: true })
    try {
      const response = await fetch(`/api/forms/${s.formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: s.title,
          description: descriptionHtml,
          fields,
          settings: {
            submitButtonText: 'Submit',
            confirmationMessage: 'Thank you for your response.',
            allowMultipleSubmissions: s.allowMultipleSubmissions,
          },
          published: s.isPublished,
          closed: s.isClosed,
          allowMultipleSubmissions: s.allowMultipleSubmissions,
          version: s.version,
        }),
      })
      if (!response.ok) throw new Error('Failed to save form')
      const payload = await response.json() as { version?: number }
      if (typeof payload.version === 'number') {
        dispatch({ type: 'SET_VERSION', version: payload.version })
      }
      if (stateRef.current.saveGeneration === capturedGeneration) {
        dispatch({ type: 'MARK_CLEAN' })
      } else {
        dispatch({ type: 'SET_SAVING', isSaving: false })
      }
    } catch {
      dispatch({ type: 'SET_SAVING', isSaving: false })
    }
  }, [])

  useEffect(() => {
    if (!state.isDirty) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(save, 1000)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state.isDirty, state.fields, state.title, state.description, state.isPublished, state.isClosed, state.allowMultipleSubmissions, save])

  return (
    <BuilderContext.Provider value={{ state, dispatch, save }}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}
