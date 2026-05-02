import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { KeyRound, LogIn, Mail } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login, clearAuthError } from '../store/authSlice'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth)

  const from =
    typeof location.state?.from === 'string' && location.state.from.startsWith('/')
      ? location.state.from
      : '/explore'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const onSubmit = handleSubmit(async (values) => {
    const resultAction = await dispatch(login(values))
    if (login.fulfilled.match(resultAction)) {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } else {
      toast.error(resultAction.payload || 'Login failed')
    }
  })

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-[380px] flex-col justify-center px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-44 max-w-md rounded-full bg-navy-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-navy-100 bg-white p-8 shadow-lg shadow-navy-950/5">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-950 text-white shadow-lg shadow-navy-900/30">
          <LogIn className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-center text-2xl font-semibold tracking-tight text-navy-950">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-navy-600">
          New here?{' '}
          <Link to="/register" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
            Sign up
          </Link>
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            icon={KeyRound}
            error={errors.password?.message}
            {...register('password')}
          />
          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <Button type="submit" className="w-full gap-2 font-semibold shadow-md shadow-navy-900/10" loading={loading}>
            <LogIn className="h-4 w-4 opacity-90" aria-hidden />
            Log in
          </Button>
        </form>
      </div>
    </div>
  )
}
