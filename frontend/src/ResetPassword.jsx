/* global window */
import { useState, useEffect, useRef } from 'react'
import { resetPassword } from './api'

export default function ResetPassword ({ onNavigate }) {
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('form')
  const [redirectSeconds, setRedirectSeconds] = useState(3)
  const redirectRef = useRef(null)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    if (!t) {
      setStatus('invalid')
    } else {
      setToken(t)
    }
  }, [])

  useEffect(() => () => {
    if (redirectRef.current) clearInterval(redirectRef.current)
  }, [])

  const handleSubmit = async () => {
    setError(null)

    if (!password || !confirm) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setStatus('success')
      let s = 3
      setRedirectSeconds(s)
      redirectRef.current = setInterval(() => {
        s -= 1
        setRedirectSeconds(s)
        if (s <= 0) {
          clearInterval(redirectRef.current)
          redirectRef.current = null
          onNavigate('/')
        }
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && status === 'form') handleSubmit()
  }

  return (
    <div className='min-h-screen bg-gray-950 text-white flex items-center justify-center p-6'>
      {/* Background Effects */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl' />
        <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl' />
      </div>

      <div className='relative w-full max-w-md'>
        {/* Logo & Header */}
        <div className='text-center mb-10'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Reset your password</h1>
          <p className='text-gray-400'>Choose a new password for your account.</p>
        </div>

        {/* Card */}
        <div className='bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl'>
          {status === 'invalid' && (
            <div className='flex flex-col items-center gap-4 py-2'>
              <div className='w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center'>
                <svg className='w-8 h-8 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <p className='text-red-400 text-sm text-center'>Invalid reset link. Please request a new password reset.</p>
              <button
                onClick={() => onNavigate('/forgot-password')}
                className='mt-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25'
              >
                Request a new reset link
              </button>
              <button
                onClick={() => onNavigate('/')}
                className='text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors'
              >
                Back to sign in
              </button>
            </div>
          )}

          {status === 'form' && (
            <>
              {/* New Password */}
              <div className='space-y-2 mb-4'>
                <label className='block text-sm font-medium text-gray-400'>New password</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  </div>
                  <input
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='w-full bg-gray-800/50 text-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                    placeholder='••••••••'
                    autoFocus
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className='space-y-2 mb-6'>
                <label className='block text-sm font-medium text-gray-400'>Confirm new password</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  </div>
                  <input
                    type='password'
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='w-full bg-gray-800/50 text-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                    placeholder='••••••••'
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3'>
                  <svg className='w-5 h-5 text-red-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='text-red-400 text-sm'>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25'
              >
                {loading
                  ? (
                    <>
                      <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      Resetting...
                    </>
                    )
                  : 'Reset password'}
              </button>

              <p className='text-center text-sm text-gray-500 mt-6'>
                Remembered your password?{' '}
                <button
                  onClick={() => onNavigate('/')}
                  className='text-indigo-400 hover:text-indigo-300 font-medium'
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {status === 'success' && (
            <div className='flex flex-col items-center gap-4 py-2'>
              <div className='w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center'>
                <svg className='w-8 h-8 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <div className='text-center'>
                <h2 className='text-xl font-semibold text-white mb-1'>Password updated</h2>
                <p className='text-gray-400 text-sm'>Your password has been reset. You can now sign in with your new password.</p>
              </div>
              <button
                onClick={() => onNavigate('/')}
                className='mt-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25'
              >
                Go to sign in
              </button>
              <p className='text-gray-500 text-xs'>Redirecting in {redirectSeconds}s...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
