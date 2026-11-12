import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAppState } from './state/AppContext'
import Landing from './components/landing/Landing'
import Layout from './components/layout/Layout'
import ProfileSelector from './components/profile/ProfileSelector'
import Dashboard from './components/dashboard/Dashboard'
import SavingsSimulator from './components/simulators/SavingsSimulator'
import LoanSimulator from './components/simulators/LoanSimulator'
import PayslipUploader from './components/payslip/PayslipUploader'
import Chat from './components/chat/Chat'
import EvalQuiz from './components/quiz/EvalQuiz'
import styles from './App.module.css'

function App() {
  const [view, setView] = useState('landing') // 'landing' | 'pick' | 'demo'
  const [activeTab, setActiveTab] = useState('dashboard')

  const {
    profile, summary, savings, loan, payslip, messages,
    loading, error,
    selectProfile, runSavings, runLoan, analyzePayslip, askChat,
    clearError,
  } = useAppState()

  const handlePickProfile = async (profileData) => {
    const saved = await selectProfile(profileData)
    if (saved) {
      setActiveTab('dashboard')
      setView('demo')
    }
  }

  const handleTabChange = (tab) => {
    clearError()
    setActiveTab(tab)
  }

  if (view === 'landing') {
    return <Landing onEnterDemo={() => setView('pick')} />
  }

  if (view === 'pick') {
    return (
      <div className={styles.pickerPage}>
        <button className={styles.backButton} onClick={() => setView('landing')}>
          <ArrowLeft size={16} /> Volver
        </button>
        <ProfileSelector
          activeProfileId={profile?.profile_id ?? null}
          onSelectProfile={handlePickProfile}
          isLoading={loading}
          error={error}
        />
      </div>
    )
  }

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange} onGoHome={() => setView('landing')} profileName={profile?.alias ?? null}>
      {activeTab === 'dashboard' && (
        <Dashboard
          data={summary}
          onAction={null}
          isLoading={loading}
          error={error}
          profileName={profile?.alias ?? null}
        />
      )}
      {activeTab === 'savings' && (
        <SavingsSimulator
          result={savings}
          onSimulate={runSavings}
          isLoading={loading}
          error={error}
        />
      )}
      {activeTab === 'loan' && (
        <LoanSimulator
          result={loan}
          onSimulate={runLoan}
          isLoading={loading}
          error={error}
        />
      )}
      {activeTab === 'payslip' && (
        <PayslipUploader
          result={payslip}
          onUpload={analyzePayslip}
          onReset={() => {}}
          isLoading={loading}
          error={error}
        />
      )}
      {activeTab === 'chat' && (
        <Chat
          messages={messages}
          onSend={askChat}
          isLoading={loading}
          error={error}
          profile={profile}
        />
      )}
      {activeTab === 'eval' && <EvalQuiz />}
    </Layout>
  )
}

export default App
