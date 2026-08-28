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
import type { EmblemId } from '../components/HeroEmblem'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  implemented: boolean
  description: string
  /** Cor do módulo — vem do herói que o representa. */
  color: string
  /** Herói associado ao módulo, exibido no cabeçalho da tela. */
  hero: string
  /** Emblema desenhado desse herói. */
  emblem: EmblemId
}

/**
 * Fonte única de verdade dos módulos: Home, cabeçalho e rotas leem daqui.
 * São 12 de propósito — fecham a grade 4x3 sem sobra.
 *
 * Cada módulo tem um herói cuja característica combina com a função da tela.
 */
export const MODULES: NavItem[] = [
  {
    path: '/hoje',
    label: 'Hoje',
    icon: Sun,
    implemented: true,
    description: 'Resumo do seu dia',
    color: '#e0263c',
    hero: 'Capitão América',
    emblem: 'shield',
  },
  {
    path: '/agenda',
    label: 'Agenda',
    icon: Calendar,
    implemented: true,
    description: 'Compromissos e eventos',
    color: '#ff9a3c',
    hero: 'Doutor Estranho',
    emblem: 'portal',
  },
  {
    path: '/financas',
    label: 'Finanças',
    icon: Wallet,
    implemented: true,
    description: 'Gastos, receitas e orçamento',
    color: '#f0a92c',
    hero: 'Homem de Ferro',
    emblem: 'reactor',
  },
  {
    path: '/tarefas',
    label: 'Tarefas',
    icon: ListChecks,
    implemented: true,
    description: 'O que precisa ser feito',
    color: '#e34a4a',
    hero: 'Homem-Aranha',
    emblem: 'web',
  },
  {
    path: '/metas',
    label: 'Metas',
    icon: Target,
    implemented: true,
    description: 'Objetivos e progresso',
    color: '#c85050',
    hero: 'Gavião Arqueiro',
    emblem: 'arrow',
  },
  {
    path: '/habitos',
    label: 'Hábitos',
    icon: Repeat,
    implemented: true,
    description: 'Rotinas e constância',
    color: '#6db3f2',
    hero: 'Thor',
    emblem: 'hammer',
  },
  {
    path: '/projetos',
    label: 'Projetos',
    icon: FolderKanban,
    implemented: true,
    description: 'Projetos em andamento',
    color: '#9d7ce0',
    hero: 'Pantera Negra',
    emblem: 'claws',
  },
  {
    path: '/estudos',
    label: 'Estudos',
    icon: GraduationCap,
    implemented: true,
    description: 'Matérias e progresso',
    color: '#f5c33b',
    hero: 'Visão',
    emblem: 'gem',
  },
  {
    path: '/saude',
    label: 'Saúde',
    icon: HeartPulse,
    implemented: true,
    description: 'Rotina e bem-estar',
    color: '#4caf50',
    hero: 'Hulk',
    emblem: 'fist',
  },
  {
    path: '/notas',
    label: 'Notas',
    icon: StickyNote,
    implemented: true,
    description: 'Informações importantes',
    color: '#ff6b7d',
    hero: 'Feiticeira Escarlate',
    emblem: 'hex',
  },
  {
    path: '/assistente',
    label: 'Assistente',
    icon: Shield,
    implemented: true,
    description: 'Seu esquadrão de IA',
    color: '#3fc9ff',
    hero: 'J.A.R.V.I.S.',
    emblem: 'core',
  },
  {
    path: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    implemented: true,
    description: 'Preferências do sistema',
    color: '#7f93bb',
    hero: 'Nick Fury',
    emblem: 'eagle',
  },
]

export function findModule(pathname: string): NavItem | undefined {
  return MODULES.find((m) => pathname === m.path || pathname.startsWith(m.path + '/'))
}
