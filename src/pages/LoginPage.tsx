import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { authState, login } = useAuth()
  const navigate = useNavigate()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (authState.isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const isSubmitDisabled = !loginValue.trim() || !password || isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitDisabled) {
      return
    }

    setError('')
    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 400))

    const result = login(loginValue, password)

    if (!result.success) {
      setError(result.message ?? 'Invalid credentials')
      setIsSubmitting(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101827] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>

      <section className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_32px_120px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 shadow-lg shadow-emerald-500/10">
          <BrandLogo className="h-10" />
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">XON&apos;s Garden</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.28em] text-slate-400">Admin Login</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Sign in to access the admin dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Login</span>
            <div className="group relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-emerald-300" />
              <input
                autoComplete="username"
                autoFocus
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 pl-12 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-400 focus:bg-slate-900 focus:ring-4 focus:ring-emerald-400/15"
                disabled={isSubmitting}
                onChange={(event) => {
                  setLoginValue(event.target.value)
                  if (error) {
                    setError('')
                  }
                }}
                placeholder="Enter your login"
                type="text"
                value={loginValue}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
            <div className="group relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-emerald-300" />
              <input
                autoComplete="current-password"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 pl-12 pr-14 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-400 focus:bg-slate-900 focus:ring-4 focus:ring-emerald-400/15"
                disabled={isSubmitting}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) {
                    setError('')
                  }
                }}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                disabled={isSubmitting}
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? (
            <div
              aria-live="polite"
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </div>
          ) : null}

          <button
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:hover:translate-y-0"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </section>
    </div>
  )
}
