import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { KeyRound, Mail, Shield, UserPlus, UserRound } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { register as registerUser, clearAuthError } from '../store/authSlice'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z
  .object({
    username: z.string().min(2, 'Username is required').max(150, 'Too long'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirm: z.string().min(1, 'Confirm your password'),
    role: z.enum(['consumer', 'creator']),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })

export function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      role: 'consumer',
    },
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/explore', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      password_confirm: values.password_confirm,
      role: values.role,
    }
    const action = await dispatch(registerUser(payload))
    if (registerUser.fulfilled.match(action)) {
      toast.success('Account created.')
      if (action.payload?.access) {
        navigate('/explore', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } else {
      toast.error(action.payload || 'Registration failed')
    }
  })

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-[380px] flex-col justify-center px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-52 max-w-lg rounded-full bg-navy-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-navy-100 bg-white p-8 shadow-lg shadow-navy-950/5">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-950 text-white shadow-lg shadow-navy-900/30">
          <UserPlus className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-center text-2xl font-semibold tracking-tight text-navy-950">Create account</h1>
        <p className="mt-2 text-center text-sm text-navy-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <Input
            label="Username"
            autoComplete="username"
            placeholder="Username"
            icon={UserRound}
            error={errors.username?.message}
            {...register('username')}
          />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={KeyRound}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            icon={KeyRound}
            error={errors.password_confirm?.message}
            {...register('password_confirm')}
          />
          <div className="w-full text-left">
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-navy-800">
              I am joining as
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-navy-400">
                <Shield className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <select
                id="role"
                className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-10 text-sm text-navy-950 shadow-sm transition focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
                {...register('role')}
              >
                <option value="consumer">Consumer — browse and engage</option>
                <option value="creator">Creator — upload and manage</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <p className="mt-1.5 text-xs text-navy-500">
              Admin access is assigned by platform operators.
            </p>
          </div>
          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <Button type="submit" className="w-full gap-2 font-semibold shadow-md shadow-navy-900/10" loading={loading}>
            <UserPlus className="h-4 w-4 opacity-90" aria-hidden />
            Sign up
          </Button>
        </form>
      </div>
    </div>
  )
}
