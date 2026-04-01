import { useAppStore, type AppModule } from '../../stores/useAppStore'

const navItems: { module: AppModule; label: string; icon: string; description: string }[] = [
  {
    module: 'patient',
    label: 'Patient Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    description: 'Diagnosis, treatments, biomarkers',
  },
  {
    module: 'research',
    label: 'Research Queue',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    description: 'Track research questions & findings',
  },
  {
    module: 'trials',
    label: 'Clinical Trials',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    description: 'Search ClinicalTrials.gov',
  },
  {
    module: 'analysis',
    label: 'Pattern Analysis',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    description: 'AI-driven deep analysis',
  },
  {
    module: 'brief',
    label: 'Doctor Brief',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    description: 'Build summary for medical team',
  },
]

export function Sidebar() {
  const { activeModule, setActiveModule } = useAppStore()

  return (
    <nav className="w-56 bg-gray-900 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Research Workspace</p>
      </div>
      <ul className="flex-1 py-2">
        {navItems.map(({ module, label, icon, description }) => {
          const isActive = activeModule === module
          return (
            <li key={module}>
              <button
                onClick={() => setActiveModule(module)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg
                  className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
