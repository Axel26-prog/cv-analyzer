/* global window */
import { useState, useEffect } from 'react'
import { getApplications, createApplication, updateApplication, deleteApplication } from './api'

const STATUS_OPTIONS = ['applied', 'interview', 'rejected', 'offer']

const statusStyles = {
  applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  interview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  offer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
}

const todayStr = () => new Date().toISOString().split('T')[0]

const emptyForm = () => ({
  company_name: '',
  position: '',
  job_url: '',
  applied_date: todayStr(),
  notes: ''
})

export default function Applications () {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchApps = () => {
    setLoading(true)
    setError(null)
    getApplications(filter === 'all' ? null : filter)
      .then(res => setApplications(res.data))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchApps() }, [filter])

  const handleSubmit = async () => {
    setFormError(null)
    if (!form.company_name || !form.position) {
      setFormError('Company and position are required')
      return
    }
    setFormLoading(true)
    try {
      await createApplication(form)
      setShowForm(false)
      setForm(emptyForm())
      fetchApps()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setFormLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a))
    try {
      await updateApplication(id, { status: newStatus })
    } catch {
      setError('Failed to update status.')
      fetchApps()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return
    setApplications(apps => apps.filter(a => a.id !== id))
    try {
      await deleteApplication(id)
    } catch {
      setError('Failed to delete application.')
      fetchApps()
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h2 className='text-xl font-bold text-white'>Applications</h2>
        <button
          onClick={() => setShowForm(true)}
          className='flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-500/25'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Add application
        </button>
      </div>

      {/* Filter */}
      <div className='flex flex-wrap gap-1 p-1 bg-gray-800/50 rounded-xl'>
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`capitalize px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3'>
          <svg className='w-5 h-5 text-red-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <span className='text-red-400 text-sm'>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <svg className='animate-spin w-8 h-8 text-indigo-400' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && applications.length === 0 && (
        <div className='bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center'>
          <p className='text-gray-400 text-sm'>No applications yet. Click “Add application” to start tracking your job search.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && applications.length > 0 && (
        <div className='overflow-x-auto bg-gray-900/50 rounded-2xl border border-gray-800'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider'>
                <th className='text-left px-4 py-3 font-medium'>Company</th>
                <th className='text-left px-4 py-3 font-medium'>Position</th>
                <th className='text-left px-4 py-3 font-medium'>Status</th>
                <th className='text-left px-4 py-3 font-medium'>Applied</th>
                <th className='text-left px-4 py-3 font-medium'>Link</th>
                <th className='text-left px-4 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className='border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors'>
                  <td className='px-4 py-3 text-white font-medium'>{app.company_name}</td>
                  <td className='px-4 py-3 text-gray-300'>{app.position}</td>
                  <td className='px-4 py-3'>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-gray-400'>{new Date(app.applied_date).toLocaleDateString()}</td>
                  <td className='px-4 py-3'>
                    {app.job_url
                      ? (
                        <a href={app.job_url} target='_blank' rel='noopener noreferrer' className='text-indigo-400 hover:text-indigo-300 text-sm'>
                          View ↗
                        </a>
                        )
                      : <span className='text-gray-600'>—</span>}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                        className='bg-gray-800 text-gray-200 rounded-lg px-2 py-1.5 text-xs border border-gray-700 focus:border-indigo-500 outline-none capitalize cursor-pointer'
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} className='bg-gray-800'>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className='text-gray-500 hover:text-red-400 transition-colors p-1'
                        title='Delete'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50' onClick={() => setShowForm(false)}>
          <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-lg w-full shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-white'>Add application</h3>
              <button onClick={() => setShowForm(false)} className='text-gray-500 hover:text-white transition-colors'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-400 mb-2'>Company</label>
                  <input
                    type='text'
                    value={form.company_name}
                    onChange={e => setForm({ ...form, company_name: e.target.value })}
                    autoFocus
                    className='w-full bg-gray-800/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                    placeholder='Google'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-400 mb-2'>Position</label>
                  <input
                    type='text'
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                    className='w-full bg-gray-800/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                    placeholder='Software Engineer'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Job URL (optional)</label>
                <input
                  type='url'
                  value={form.job_url}
                  onChange={e => setForm({ ...form, job_url: e.target.value })}
                  className='w-full bg-gray-800/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600'
                  placeholder='https://jobs.google.com/...'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Applied date</label>
                <input
                  type='date'
                  value={form.applied_date}
                  onChange={e => setForm({ ...form, applied_date: e.target.value })}
                  className='w-full bg-gray-800/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className='w-full bg-gray-800/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 transition-colors placeholder-gray-600 resize-none'
                  placeholder='Recruiter name, interview details, etc.'
                />
              </div>

              {formError && (
                <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3'>
                  <svg className='w-5 h-5 text-red-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='text-red-400 text-sm'>{formError}</span>
                </div>
              )}
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => setShowForm(false)}
                className='flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all text-sm'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className='flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/25'
              >
                {formLoading
                  ? (
                    <>
                      <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                      </svg>
                      Saving...
                    </>
                    )
                  : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
