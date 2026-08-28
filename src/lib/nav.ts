import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Wallet,
  ListChecks,
  Target,
  Repeat,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  StickyNote,
  Sparkles,
  Settings,
} from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  implemented: boolean
  description: string
  /** Cor de destaque do módulo — dá identidade a cada área sem poluir. */
  color: string
}

/**
 * Fonte única de verdade dos módulos: a Home, a barra lateral e as rotas dos
 * placeholders são todas geradas daqui. Adicionar um módulo começa por aqui.
 */
export const MODULES: NavItem[] = [
  {
    path: '/agenda',
    label: 'Agenda',
    icon: Calendar,
    implemented: true,
    description: 'Compromissos e eventos',
    color: '#5b8def',
  },
  {
    path: '/financas',
    label: 'Finanças',
    icon: Wallet,
    implemented: true,
    description: 'Gastos, receitas e orçamento',
    color: '#d4a53c',
  },
  {
    path: '/tarefas',
    label: 'Tarefas',
    icon: ListChecks,
    implemented: true,
    description: 'O que precisa ser feito',
    color: '#46a758',
  },
  {
    path: '/metas',
    label: 'Metas',
    icon: Target,
    implemented: true,
    description: 'Objetivos e progresso',
    color: '#e5484d',
  },
  {
    path: '/habitos',
    label: 'Hábitos',
    icon: Repeat,
    implemented: true,
    description: 'Rotinas e constância',
    color: '#8e5bef',
  },
  {
    path: '/projetos',
    label: 'Projetos',
    icon: FolderKanban,
    implemented: true,
    description: 'Projetos em andamento',
    color: '#ef8e5b',
  },
  {
    path: '/estudos',
    label: 'Estudos',
    icon: GraduationCap,
    implemented: true,
    description: 'Matérias e progresso',
    color: '#3bb7c4',
  },
  {
    path: '/saude',
    label: 'Saúde',
    icon: HeartPulse,
    implemented: true,
    description: 'Rotina e bem-estar',
    color: '#ef5b9c',
  },
  {
    path: '/notas',
    label: 'Notas',
    icon: StickyNote,
    implemented: true,
    description: 'Informações importantes',
    color: '#c4b73b',
  },
  {
    path: '/assistente',
    label: 'Assistente',
    icon: Sparkles,
    implemented: true,
    description: 'Seu copiloto de IA',
    color: '#f7dfa0',
  },
  {
    path: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    implemented: true,
    description: 'Preferências do sistema',
    color: '#8b8d92',
  },
]

export function findModule(pathname: string): NavItem | undefined {
  return MODULES.find((m) => pathname === m.path || pathname.startsWith(m.path + '/'))
}
