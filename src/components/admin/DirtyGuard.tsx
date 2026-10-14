'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useState, type ComponentProps, type ReactNode } from 'react'

const LEAVE_MESSAGE = 'You have unsaved changes. Leave this page without saving them?'

type Guard = { dirty: boolean; setDirty: (dirty: boolean) => void; confirmLeave: () => boolean }
const GuardContext = createContext<Guard>({ dirty: false, setDirty: () => {}, confirmLeave: () => true })

/** Tracks unsaved edits and warns before the owner navigates or closes the tab. */
export function DirtyGuardProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const confirmLeave = useCallback(() => {
    if (!dirty || window.confirm(LEAVE_MESSAGE)) {
      setDirty(false)
      return true
    }
    return false
  }, [dirty])

  return <GuardContext.Provider value={{ dirty, setDirty, confirmLeave }}>{children}</GuardContext.Provider>
}

export function useDirtyGuard() {
  return useContext(GuardContext)
}

/** A link that asks before leaving unsaved changes. */
export function GuardedLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { confirmLeave } = useDirtyGuard()
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (!confirmLeave()) event.preventDefault()
        onClick?.(event)
      }}
    />
  )
}
