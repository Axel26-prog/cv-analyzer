import { useState } from 'react'
import { requestPasswordReset } from './api'

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function ForgotPassword ({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setError(null)

    if (!email) {
      setError('Please enter your email')
      return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !sent) handleSubmit()
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
          <h1 className='text-3xl font-bold text-white mb-2'>Forgot password?</h1>
          <p className='text-gray-400'>Enter your email and we'll send you a reset link.</p>
        </div>

        {/* Card */}
        <div className='bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl'>
          {sent
            ? (
              <div className='flex flex-col items-center gap-4 py-2'>
                <div className='w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center'>
                  <svg className='w-8 h-8 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='text-center'>
                  <h2 className='text-xl font-semibold text-white mb-1'>Check your inbox</h2>
                  <p className='text-gray-400 text-sm'>If that email exists, we've sent a password reset link. Check your inbox.</p>
                </div>
                <button
                  onClick={() => onNavigate('/')}
                  className='mt-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25'
                >
                  Back to sign in
                </button>
              </div>
              )
            : (
              <>
                {/* Email Field */}
                <div className='space-y-2 mb-6'>
                  <label className='block text-sm font-medium text-gray-400'>Email</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                      </svg>
                    </div>
                    <input
                      type='email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className='w-full bg-gray-800/50 text-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                      placeholder='you@example.com'
                      autoFocus
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
                        Sending...
                      </>
                      )
                    : 'Send reset link'}
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
        </div>
      </div>
    </div>
  )
}
