import type { LucideIcon } from 'lucide-react'
import {
  Sun,
  Calendar,
  Wallet,
  ListChecks,
  Target,
  Repeat,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  StickyNote,
  Shield,
  Settings,
} from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  implemented: boolean
  description: string
  /** Cor do módulo — tirada da paleta do escudo para o conjunto ficar coeso. */
  color: string
}

const RED = '#e0263c'
const BLUE = '#2f6df0'
const SILVER = '#a8bbdd'
const SKY = '#5b93ff'

/**
 * Fonte única de verdade dos módulos: Home, cabeçalho e rotas leem daqui.
 * São 12 itens de propósito — fecham a grade 4x3 sem sobra.
 */
export const MODULES: NavItem[] = [
  { path: '/hoje', label: 'Hoje', icon: Sun, implemented: true, description: 'Resumo do seu dia', color: RED },
  { path: '/agenda', label: 'Agenda', icon: Calendar, implemented: true, description: 'Compromissos e eventos', color: BLUE },
  { path: '/financas', label: 'Finanças', icon: Wallet, implemented: true, description: 'Gastos, receitas e orçamento', color: SILVER },
  { path: '/tarefas', label: 'Tarefas', icon: ListChecks, implemented: true, description: 'O que precisa ser feito', color: SKY },
  { path: '/metas', label: 'Metas', icon: Target, implemented: true, description: 'Objetivos e progresso', color: RED },
  { path: '/habitos', label: 'Hábitos', icon: Repeat, implemented: true, description: 'Rotinas e constância', color: BLUE },
  { path: '/projetos', label: 'Projetos', icon: FolderKanban, implemented: true, description: 'Projetos em andamento', color: SILVER },
  { path: '/estudos', label: 'Estudos', icon: GraduationCap, implemented: true, description: 'Matérias e progresso', color: SKY },
  { path: '/saude', label: 'Saúde', icon: HeartPulse, implemented: true, description: 'Rotina e bem-estar', color: RED },
  { path: '/notas', label: 'Notas', icon: StickyNote, implemented: true, description: 'Informações importantes', color: SILVER },
  { path: '/assistente', label: 'Assistente', icon: Shield, implemented: true, description: 'Seu esquadrão de IA', color: BLUE },
  { path: '/configuracoes', label: 'Configurações', icon: Settings, implemented: true, description: 'Preferências do sistema', color: '#5b6a90' },
]

export function findModule(pathname: string): NavItem | undefined {
  return MODULES.find((m) => pathname === m.path || pathname.startsWith(m.path + '/'))
}
