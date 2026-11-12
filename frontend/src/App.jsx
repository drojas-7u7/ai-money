import { useState } from 'react'
import Layout from './components/layout/Layout'

// Stubs temporales: se reemplazan por el import real al construir cada componente
function ProfileSelector()  { return <p style={{ padding: 24 }}>Perfil — próximamente</p> }
function Dashboard()        { return <p style={{ padding: 24 }}>Dashboard — próximamente</p> }
function SavingsSimulator() { return <p style={{ padding: 24 }}>Simulador de ahorro — próximamente</p> }
function LoanSimulator()    { return <p style={{ padding: 24 }}>Simulador de préstamo — próximamente</p> }
function PayslipUploader()  { return <p style={{ padding: 24 }}>Nómina — próximamente</p> }
function Chat()             { return <p style={{ padding: 24 }}>Chat IA — próximamente</p> }

const VIEWS = {
  profile:   ProfileSelector,
  dashboard: Dashboard,
  savings:   SavingsSimulator,
  loan:      LoanSimulator,
  payslip:   PayslipUploader,
  chat:      Chat,
}

function App() {
  const [activeTab, setActiveTab] = useState('profile')
  const View = VIEWS[activeTab]

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <View />
    </Layout>
  )
}

export default App
