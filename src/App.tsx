import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FxProvider } from './lib/fx'
import Busca from './components/Busca'
import Layout from './components/Layout'
import Login from './pages/Login'
import SetupNeeded from './pages/SetupNeeded'
import Home from './pages/Home'
import Settings from './pages/Settings'
import AssistantWidget from './components/AssistantWidget'
import Today from './pages/modules/Today'
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
import FinanceInvestments from './pages/finance/FinanceInvestments'
import FinanceAccounts from './pages/finance/FinanceAccounts'
import FinanceGoals from './pages/finance/FinanceGoals'
import FinanceMore from './pages/finance/FinanceMore'
import { isSupabaseConfigured } from './lib/supabase'

function AppRoutes() {
  const { session, loading } = useAuth()
  const [buscaAberta, setBuscaAberta] = useState(false)

  // Ctrl+K (ou ⌘K) abre a busca de qualquer tela. O `preventDefault` impede o
  // navegador de sequestrar o atalho para a barra de endereço.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setBuscaAberta((v) => !v)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  // A Home tem um botão próprio; este evento liga os dois sem passar prop por
  // dentro das rotas.
  useEffect(() => {
    const abrir = () => setBuscaAberta(true)
    window.addEventListener('tjv:abrir-busca', abrir)
    return () => window.removeEventListener('tjv:abrir-busca', abrir)
  }, [])

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-text-dim">Carregando...</div>
    )
  }

  if (!session) return <Login />

  return (
    <>
      <Routes>
        {/* A Home fica fora do Layout: lá não há navegação lateral, só os módulos. */}
        <Route path="/" element={<Home />} />

        <Route element={<Layout />}>
          <Route path="/hoje" element={<Today />} />
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
            <Route path="investimentos" element={<FinanceInvestments />} />
            <Route path="contas" element={<FinanceAccounts />} />
            <Route path="metas" element={<FinanceGoals />} />
            <Route path="mais" element={<FinanceMore />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bolha de suporte — acompanha o Joshua em todas as telas. */}
      <AssistantWidget />

      {/* Busca geral: Ctrl+K de qualquer tela, ou o botão na Home. */}
      <Busca aberta={buscaAberta} fechar={() => setBuscaAberta(false)} />
    </>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Efeitos (estouros, som, voz) precisam do Router por dentro: eles
            olham em que módulo o Joshua está para saber a cor e a fala. */}
        <FxProvider>
          <AppRoutes />
        </FxProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
