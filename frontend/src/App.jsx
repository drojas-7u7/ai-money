import { useState } from 'react'
import Layout from './components/layout/Layout'
import ProfileSelector from './components/profile/ProfileSelector'
import Dashboard from './components/dashboard/Dashboard'

// Stubs temporales: se reemplazan por el import real al construir cada componente
function SavingsSimulator() { return <p style={{ padding: 24 }}>Simulador de ahorro — próximamente</p> }
function LoanSimulator()    { return <p style={{ padding: 24 }}>Simulador de préstamo — próximamente</p> }
function PayslipUploader()  { return <p style={{ padding: 24 }}>Nómina — próximamente</p> }
function Chat()             { return <p style={{ padding: 24 }}>Chat IA — próximamente</p> }

// Deriva el resumen que usará Dashboard desde el perfil activo (mock hasta que David conecte la API)
function buildSummaryMock(profile) {
  if (!profile) return null
  const expenses = profile.fixed_expenses + profile.variable_expenses
  const available = profile.monthly_income - expenses
  const savings_rate = parseFloat(((available / profile.monthly_income) * 100).toFixed(2))
  return {
    income: profile.monthly_income,
    expenses,
    available,
    savings_rate,
    goals: [profile.goal],
    breakdown: {
      fixed: profile.fixed_expenses,
      variable: profile.variable_expenses,
    },
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('profile')
  const [activeProfile, setActiveProfile] = useState(null)

  const summaryData = buildSummaryMock(activeProfile)

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'profile' && (
        <ProfileSelector
          activeProfileId={activeProfile?.profile_id ?? null}
          onSelectProfile={setActiveProfile}
          isLoading={false}
          error={null}
        />
      )}
      {activeTab === 'dashboard' && (
        <Dashboard
          data={summaryData}
          onAction={null}
          isLoading={false}
          error={null}
          profileName={activeProfile?.alias ?? null}
        />
      )}
      {activeTab === 'savings'  && <SavingsSimulator />}
      {activeTab === 'loan'     && <LoanSimulator />}
      {activeTab === 'payslip'  && <PayslipUploader />}
      {activeTab === 'chat'     && <Chat />}
    </Layout>
  )
}

export default App
