import { useState } from 'react'
import Layout from './components/layout/Layout'
import ProfileSelector from './components/profile/ProfileSelector'

// Stubs temporales: se reemplazan por el import real al construir cada componente
function Dashboard()        { return <p style={{ padding: 24 }}>Dashboard — próximamente</p> }
function SavingsSimulator() { return <p style={{ padding: 24 }}>Simulador de ahorro — próximamente</p> }
function LoanSimulator()    { return <p style={{ padding: 24 }}>Simulador de préstamo — próximamente</p> }
function PayslipUploader()  { return <p style={{ padding: 24 }}>Nómina — próximamente</p> }
function Chat()             { return <p style={{ padding: 24 }}>Chat IA — próximamente</p> }

function App() {
  const [activeTab, setActiveTab] = useState('profile')
  const [activeProfile, setActiveProfile] = useState(null)

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'profile'    && (
        <ProfileSelector
          activeProfileId={activeProfile?.profile_id ?? null}
          onSelectProfile={setActiveProfile}
          isLoading={false}
          error={null}
        />
      )}
      {activeTab === 'dashboard'  && <Dashboard />}
      {activeTab === 'savings'    && <SavingsSimulator />}
      {activeTab === 'loan'       && <LoanSimulator />}
      {activeTab === 'payslip'    && <PayslipUploader />}
      {activeTab === 'chat'       && <Chat />}
    </Layout>
  )
}

export default App
