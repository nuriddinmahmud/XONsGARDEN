/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STATIC_ADMIN } from '../constants/auth'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type { AuthState } from '../types'
import { clearSession, readAuthState, writeAuthState } from '../utils/localStorage'

interface AuthContextValue {
  authState: AuthState
  login: (login: string, password: string) => { success: boolean; message?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => readAuthState())

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined

      if (customEvent?.detail?.key && customEvent.detail.key !== STORAGE_KEYS.auth) {
        return
      }

      setAuthState(readAuthState())
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      login: (login, password) => {
        const isValid = login.trim() === STATIC_ADMIN.login && password === STATIC_ADMIN.password

        if (!isValid) {
          return {
            success: false,
            message: 'Invalid credentials',
          }
        }

        const nextState: AuthState = {
          isAuthenticated: true,
          login: STATIC_ADMIN.login,
        }

        setAuthState(nextState)
        writeAuthState(nextState)

        return { success: true }
      },
      logout: () => {
        clearSession()
        setAuthState(readAuthState())
      },
    }),
    [authState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
