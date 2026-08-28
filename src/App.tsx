import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import SetupNeeded from './pages/SetupNeeded'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Agenda from './pages/modules/Agenda'
import Tasks from './pages/modules/Tasks'
import Goals from './pages/modules/Goals'
import Habits from './pages/modules/Habits'
import Projects from './pages/modules/Projects'
import Studies from './pages/modules/Studies'
import Health from './pages/modules/Health'
import Notes from './pages/modules/Notes'
import Assistant from './pages/assistant/Assistant'
import FinanceLayout from './pages/finance/FinanceLayout'
import FinanceHome from './pages/finance/FinanceHome'
import FinanceTransactions from './pages/finance/FinanceTransactions'
import FinanceCategories from './pages/finance/FinanceCategories'
import FinanceBudget from './pages/finance/FinanceBudget'
import { isSupabaseConfigured } from './lib/supabase'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-text-dim">Carregando...</div>
    )
  }

  if (!session) return <Login />

  return (
    <Routes>
      {/* A Home fica fora do Layout: lá não há navegação lateral, só os módulos. */}
      <Route path="/" element={<Home />} />

      <Route element={<Layout />}>
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/tarefas" element={<Tasks />} />
        <Route path="/metas" element={<Goals />} />
        <Route path="/habitos" element={<Habits />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/estudos" element={<Studies />} />
        <Route path="/saude" element={<Health />} />
        <Route path="/notas" element={<Notes />} />
        <Route path="/assistente" element={<Assistant />} />
        <Route path="/configuracoes" element={<Settings />} />

        <Route path="/financas" element={<FinanceLayout />}>
          <Route index element={<FinanceHome />} />
          <Route path="lancamentos" element={<FinanceTransactions />} />
          <Route path="categorias" element={<FinanceCategories />} />
          <Route path="orcamento" element={<FinanceBudget />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
