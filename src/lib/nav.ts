import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  Calendar,
  Wallet,
  ListChecks,
  Target,
  Repeat,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  BookOpen,
  StickyNote,
  Compass,
  Sparkles,
  Settings,
} from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  implemented: boolean
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: LayoutGrid, implemented: true, description: 'Seu painel central' },
  { path: '/agenda', label: 'Agenda', icon: Calendar, implemented: false, description: 'Compromissos e eventos' },
  { path: '/financas', label: 'Finanças', icon: Wallet, implemented: true, description: 'Gastos, receitas e orçamento' },
  { path: '/tarefas', label: 'Tarefas', icon: ListChecks, implemented: false, description: 'O que precisa ser feito' },
  { path: '/metas', label: 'Metas', icon: Target, implemented: false, description: 'Objetivos pessoais e profissionais' },
  { path: '/habitos', label: 'Hábitos', icon: Repeat, implemented: false, description: 'Rotinas e consistência' },
  { path: '/projetos', label: 'Projetos', icon: FolderKanban, implemented: false, description: 'Projetos em andamento' },
  { path: '/estudos', label: 'Estudos', icon: GraduationCap, implemented: false, description: 'Matérias e progresso' },
  { path: '/saude', label: 'Saúde', icon: HeartPulse, implemented: false, description: 'Rotina e bem-estar' },
  { path: '/diario', label: 'Diário', icon: BookOpen, implemented: false, description: 'Espaço privado de reflexão' },
  { path: '/notas', label: 'Notas', icon: StickyNote, implemented: false, description: 'Informações importantes' },
  { path: '/visao', label: 'Visão', icon: Compass, implemented: false, description: 'Planejamento de vida e futuro' },
  { path: '/assistente', label: 'Assistente', icon: Sparkles, implemented: false, description: 'Seu copiloto de IA' },
]

export const SETTINGS_ITEM: NavItem = {
  path: '/configuracoes',
  label: 'Configurações',
  icon: Settings,
  implemented: true,
  description: 'Preferências do sistema',
}

export const HOME_MODULES = NAV_ITEMS.filter((item) => item.path !== '/')
