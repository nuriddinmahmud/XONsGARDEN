/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { STATIC_ADMIN } from '../constants/auth'
import type { AuthState } from '../types'
import { clearSession, readAuthState, writeAuthState } from '../utils/localStorage'

interface AuthContextValue {
  authState: AuthState
  login: (email: string, password: string) => { success: boolean; message?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => readAuthState())

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      login: (email, password) => {
        const isValid =
          email.trim().toLowerCase() === STATIC_ADMIN.email &&
          password === STATIC_ADMIN.password

        if (!isValid) {
          return {
            success: false,
            message: "Email yoki parol noto'g'ri. Demo login ma'lumotlaridan foydalaning.",
          }
        }

        const nextState: AuthState = {
          isAuthenticated: true,
          email: STATIC_ADMIN.email,
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
