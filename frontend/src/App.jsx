import { useState } from 'react'
import { useAppState } from './state/AppContext'
import Layout from './components/layout/Layout'
import ProfileSelector from './components/profile/ProfileSelector'
import Dashboard from './components/dashboard/Dashboard'
import SavingsSimulator from './components/simulators/SavingsSimulator'
import LoanSimulator from './components/simulators/LoanSimulator'

// Stubs temporales
function PayslipUploader() { return <p style={{ padding: 24 }}>Nómina — próximamente</p> }
function Chat()            { return <p style={{ padding: 24 }}>Chat IA — próximamente</p> }

function App() {
  const [activeTab, setActiveTab] = useState('profile')

  const {
    profile, summary, savings, loan,
    loading, error,
    selectProfile, runSavings, runLoan,
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
      {activeTab === 'payslip' && <PayslipUploader />}
      {activeTab === 'chat'    && <Chat />}
    </Layout>
  )
}

export default App
