/* global window */
import { useState, useEffect } from 'react'
import { verifyEmail } from './api'

export default function VerifyEmail ({ onNavigate }) {
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setError('Invalid verification link')
      setStatus('error')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setError(err.response?.data?.detail || 'Verification failed')
        setStatus('error')
      })
  }, [])

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
          <h1 className='text-3xl font-bold text-white mb-2'>Verify your email</h1>
        </div>

        {/* Card */}
        <div className='bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl text-center'>
          {status === 'loading' && (
            <div className='py-6 flex flex-col items-center gap-4'>
              <svg className='animate-spin w-10 h-10 text-indigo-400' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
              </svg>
              <p className='text-gray-400 text-sm'>Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className='py-2 flex flex-col items-center gap-4'>
              <div className='w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center'>
                <svg className='w-8 h-8 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-white mb-1'>Email verified</h2>
                <p className='text-gray-400 text-sm'>Your email has been verified. You can now sign in to your account.</p>
              </div>
              <button
                onClick={() => onNavigate('/')}
                className='mt-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25'
              >
                Go to sign in
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className='py-2 flex flex-col items-center gap-4'>
              <div className='w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center'>
                <svg className='w-8 h-8 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-white mb-1'>Verification failed</h2>
                <p className='text-red-400 text-sm'>{error || 'The verification link is invalid or has expired.'}</p>
              </div>
              <button
                onClick={() => onNavigate('/')}
                className='mt-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25'
              >
                Go to sign in
              </button>
              <p className='text-gray-500 text-xs mt-1'>If this keeps happening, please contact support.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
