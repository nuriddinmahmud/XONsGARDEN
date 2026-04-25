/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthState } from '../types'
import { resetGardenCache } from '../lib/database'
import { readAuthState, writeAuthState } from '../utils/localStorage'

interface AuthContextValue {
  authState: AuthState
  loading: boolean
  login: (login: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginName, setLoginName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const hydrate = async () => {
      const nextAuthState = await readAuthState()

      if (isMounted) {
        setIsAuthenticated(nextAuthState.isAuthenticated)
        setLoginName(nextAuthState.login)
        setLoading(false)
      }
    }

    void hydrate()

    return () => {
      isMounted = false
    }
  }, [])

  const authState = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      login: loginName,
    }),
    [isAuthenticated, loginName],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      loading,
      login: async (username, password) => {
        if (username !== 'XON' || password !== 'RAK') {
          return {
            success: false,
            message: 'Invalid login credentials',
          }
        }

        await writeAuthState(true)
        setIsAuthenticated(true)
        setLoginName('XON')

        return { success: true }
      },
      logout: async () => {
        await writeAuthState(false)
        resetGardenCache()
        setIsAuthenticated(false)
        setLoginName(null)
      },
    }),
    [authState, loading],
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
