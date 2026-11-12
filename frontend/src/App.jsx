import { useState } from 'react'
import { useAppState } from './state/AppContext'
import Layout from './components/layout/Layout'
import ProfileSelector from './components/profile/ProfileSelector'
import Dashboard from './components/dashboard/Dashboard'
import SavingsSimulator from './components/simulators/SavingsSimulator'
import LoanSimulator from './components/simulators/LoanSimulator'
import PayslipUploader from './components/payslip/PayslipUploader'
import Chat from './components/chat/Chat'

function App() {
  const [activeTab, setActiveTab] = useState('profile')

  const {
    profile, summary, savings, loan, payslip, messages,
    loading, error,
    selectProfile, runSavings, runLoan, analyzePayslip, askChat,
    clearError,
  } = useAppState()

  const handleTabChange = (tab) => {
    clearError()
    setActiveTab(tab)
  }

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'profile' && (
        <ProfileSelector
          activeProfileId={profile?.profile_id ?? null}
          onSelectProfile={selectProfile}
          isLoading={loading}
          error={error}
        />
      )}
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
    </Layout>
  )
}

export default App
