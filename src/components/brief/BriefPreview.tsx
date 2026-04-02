import { forwardRef } from 'react'
import type { Brief } from '../../types/brief'
import { DISCLAIMER } from '../../utils/disclaimer'

interface Props {
  brief: Brief
  patientInitials: string
}

export const BriefPreview = forwardRef<HTMLDivElement, Props>(({ brief, patientInitials }, ref) => {
  return (
    <div
      ref={ref}
      id="brief-preview-content"
      className="bg-white p-8 max-w-3xl mx-auto text-gray-900 font-sans"
    >
      {/* Disclaimer banner — top */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-6 text-xs text-amber-800 leading-relaxed">
        <strong>IMPORTANT: </strong>{DISCLAIMER}
      </div>

      {/* Title block */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{brief.title || 'Untitled Brief'}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Patient: <strong className="text-gray-700">{patientInitials || '—'}</strong></span>
          {brief.advocateName && (
            <span>Prepared by: <strong className="text-gray-700">{brief.advocateName}</strong></span>
          )}
          <span>Date: <strong className="text-gray-700">{new Date().toLocaleDateString()}</strong></span>
        </div>
      </div>

      {/* Executive Summary */}
      {brief.executiveSummary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">Executive Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{brief.executiveSummary}</p>
        </section>
      )}

      {/* Treatment Options */}
      {brief.options.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Treatment Options to Discuss ({brief.options.length})
          </h2>
          <div className="space-y-4">
            {brief.options.map((opt, i) => (
              <div key={i} className="pl-4 border-l-4 border-blue-200">
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{i + 1}. {opt.title}</p>
                {opt.summary && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{opt.summary}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Trials */}
      {brief.trialsNarrative && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">Clinical Trials</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{brief.trialsNarrative}</p>
        </section>
      )}

      {/* Questions for the Doctor */}
      {brief.questions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Questions for the Medical Team
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            {brief.questions.filter((q) => q.trim()).map((q, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">{q}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Appendix Links */}
      {brief.appendixLinks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">Appendix / References</h2>
          <ul className="space-y-1">
            {brief.appendixLinks.map((link, i) => (
              <li key={i} className="text-sm text-gray-700">
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.title || link.url}
                  </a>
                ) : (
                  <span>{link.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimer — bottom */}
      <div className="border-t-2 border-gray-200 pt-4 mt-8">
        <p className="text-xs text-gray-400 leading-relaxed">{DISCLAIMER}</p>
      </div>
    </div>
  )
})

BriefPreview.displayName = 'BriefPreview'
