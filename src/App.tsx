import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import SetupNeeded from './pages/SetupNeeded'
import Home from './pages/Home'
import Settings from './pages/Settings'
import ComingSoon from './pages/ComingSoon'
import FinanceLayout from './pages/finance/FinanceLayout'
import FinanceHome from './pages/finance/FinanceHome'
import FinanceTransactions from './pages/finance/FinanceTransactions'
import FinanceCategories from './pages/finance/FinanceCategories'
import FinanceBudget from './pages/finance/FinanceBudget'
import Assistant from './pages/assistant/Assistant'
import { HOME_MODULES } from './lib/nav'
import { isSupabaseConfigured } from './lib/supabase'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-svh flex items-center justify-center bg-bg text-text-dim">Carregando...</div>
  }

  if (!session) {
    return <Login />
  }

  const placeholderModules = HOME_MODULES.filter((m) => !m.implemented)

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/assistente" element={<Assistant />} />

        <Route path="/financas" element={<FinanceLayout />}>
          <Route index element={<FinanceHome />} />
          <Route path="lancamentos" element={<FinanceTransactions />} />
          <Route path="categorias" element={<FinanceCategories />} />
          <Route path="orcamento" element={<FinanceBudget />} />
        </Route>

        {placeholderModules.map(({ path, label, description, icon }) => (
          <Route
            key={path}
            path={path}
            element={<ComingSoon label={label} description={description} icon={icon} />}
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupNeeded />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
