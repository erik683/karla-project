import { useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DisclaimerBanner } from './DisclaimerBanner'
import { SettingsModal } from './SettingsModal'
import { PatientProfilePage } from '../patient/PatientProfilePage'
import { ResearchQueuePage } from '../research/ResearchQueuePage'
import { TrialFinderPage } from '../trials/TrialFinderPage'
import { PatternAnalysisPage } from '../analysis/PatternAnalysisPage'
import { BriefBuilderPage } from '../brief/BriefBuilderPage'

export function AppShell() {
  const { activeModule } = useAppStore()
  const { loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DisclaimerBanner />
        <Header />
        <main className="flex-1 overflow-y-auto">
          {activeModule === 'patient' && <PatientProfilePage />}
          {activeModule === 'research' && <ResearchQueuePage />}
          {activeModule === 'trials' && <TrialFinderPage />}
          {activeModule === 'analysis' && <PatternAnalysisPage />}
          {activeModule === 'brief' && <BriefBuilderPage />}
        </main>
      </div>
      <SettingsModal />
    </div>
  )
}
