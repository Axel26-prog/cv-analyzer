import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)  

    try {
      const res = await axios.post(`${API_URL}/analyze`, formData)
      setAnalysis(res.data.analysis)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">CV Analyzer</h1>
          <p className="text-gray-400 mt-2">Upload your CV and get instant AI-powered feedback</p>
        </div>

        {/* Upload */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
          <label className="block text-sm text-gray-400 mb-2">CV File (PDF or DOCX)</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={e => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
          {file && <p className="text-xs text-gray-500 mt-2">{file.name}</p>}
        </div>

        {/* Job Description */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <label className="block text-sm text-gray-400 mb-2">Job Description (optional)</label>
          <textarea
            rows={4}
            placeholder="Paste the job description here to get a match score..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 text-sm resize-none outline-none border border-gray-700 focus:border-indigo-500"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze CV'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="mt-8 space-y-4">

            {/* Score */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
              <p className="text-gray-400 text-sm mb-1">Overall Score</p>
              <p className={`text-6xl font-bold ${analysis.score >= 75 ? 'text-green-400' : analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {analysis.score}
              </p>
              <p className="text-gray-500 text-sm mt-1">out of 100</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-2">Summary</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-sm text-green-400 mb-3">Strengths</h2>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-green-500">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-sm text-yellow-400 mb-3">Improvements</h2>
                <ul className="space-y-2">
                  {analysis.improvements.map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-yellow-500">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {analysis.keywords_found.map((k, i) => (
                  <span key={i} className="bg-green-900/40 text-green-400 text-xs px-3 py-1 rounded-full border border-green-800">{k}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords_missing.map((k, i) => (
                  <span key={i} className="bg-red-900/40 text-red-400 text-xs px-3 py-1 rounded-full border border-red-800">{k}</span>
                ))}
              </div>
            </div>

            {/* ATS + Sections */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-3">ATS & Sections</h2>
              <p className={`text-sm mb-3 ${analysis.ats_friendly ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.ats_friendly ? '✓ ATS Friendly' : '✗ Not ATS Friendly'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.sections).map(([key, val]) => (
                  <div key={key} className={`text-xs px-3 py-2 rounded-lg ${val ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {val ? '✓' : '✗'} {key}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}