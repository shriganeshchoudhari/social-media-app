import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerThunk, selectAuthLoading, selectAuthError, clearError } from '../store/authSlice.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

export default function RegisterPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const loading   = useSelector(selectAuthLoading)
  const error     = useSelector(selectAuthError)
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' })

  const onChange = e => {
    dispatch(clearError())
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    const res = await dispatch(registerThunk(form))
    if (!res.error) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 tracking-tight">ConnectHub</h1>
          <p className="text-gray-500 mt-2 text-sm">Join millions of people sharing what matters</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create account</h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Display name"
              name="displayName"
              value={form.displayName}
              onChange={onChange}
              placeholder="Jane Smith"
              autoComplete="name"
            />
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="janesmith"
              autoComplete="username"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
