import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Newsletter from './pages/Newsletter'
import ApoioFiscal from './pages/ApoioFiscal'
import Importacao from './pages/Importacao'
import Validacao from './pages/Validacao'
import Reforma from './pages/Reforma'
import PageShell from './components/layout/PageShell'
import { C } from './theme/brand'

function Placeholder({ title, color }) {
  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          🚧
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{title}</div>
        <div style={{ fontSize: 13, color: C.gray4 }}>Módulo em desenvolvimento</div>
      </div>
    </PageShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/newsletter"    element={<Newsletter />} />
            <Route path="/apoio-fiscal"  element={<ApoioFiscal />} />
            <Route path="/importacao"    element={<Importacao />} />
            <Route path="/validacao"     element={<Validacao />} />
            <Route path="/reforma"       element={<Reforma />} />
            <Route path="/alertas"       element={<Placeholder title="Alertas Fiscais" color={C.amber} />} />
            <Route path="/copilot"       element={<Placeholder title="Copilot Fiscal" color={C.mid} />} />
            <Route path="/auditoria"     element={<Placeholder title="Auditoria & Logs" color={C.dark} />} />
            <Route path="/usuarios"      element={<Placeholder title="Usuários & Permissões" color={C.dark} />} />
            <Route path="/config"        element={<Placeholder title="Configurações" color={C.gray4} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
