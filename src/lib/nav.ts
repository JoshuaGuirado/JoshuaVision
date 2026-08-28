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
  Sparkles,
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
  /** Herói associado ao módulo, escolhido pelo Joshua. */
  hero: string
  /** Emblema desenhado desse herói (reserva, se a logo não carregar). */
  emblem: EmblemId
  /**
   * Logo oficial do herói, escolhida pelo Joshua. Os arquivos originais estão
   * em `public/herois/logo*.jpg`; `scripts/logos-transparentes.mjs` tira o
   * fundo e gera os PNGs em `public/logos/`.
   */
  logo: string
  /** A logo é preta (Homem-Aranha): precisa inverter para aparecer no escuro. */
  invertLogo?: boolean
}

/**
 * Fonte única de verdade dos módulos: Home, cabeçalho e rotas leem daqui.
 * São 12 de propósito — fecham a grade 4x3 sem sobra.
 *
 * O herói de cada módulo foi escolhido pelo Joshua, um a um.
 */
export const MODULES: NavItem[] = [
  {
    path: '/hoje',
    label: 'Hoje',
    icon: Sun,
    implemented: true,
    description: 'Resumo do seu dia',
    color: '#e0263c',
    hero: 'Vingadores',
    emblem: 'avengers',
    logo: '/logos/avenger.png',
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
    logo: '/logos/doutorestranho.png',
  },
  {
    path: '/financas',
    label: 'Finanças',
    icon: Wallet,
    implemented: true,
    description: 'Gastos, receitas e orçamento',
    color: '#e0263c',
    hero: 'Capitão América',
    emblem: 'shield',
    logo: '/logos/capitao.png',
  },
  {
    path: '/tarefas',
    label: 'Tarefas',
    icon: ListChecks,
    implemented: true,
    description: 'O que precisa ser feito',
    color: '#f0a92c',
    hero: 'Homem de Ferro',
    emblem: 'reactor',
    logo: '/logos/homemdeferro.png',
  },
  {
    path: '/metas',
    label: 'Metas',
    icon: Target,
    implemented: true,
    description: 'Objetivos e progresso',
    color: '#e34a4a',
    hero: 'Homem-Aranha',
    emblem: 'web',
    logo: '/logos/homemaranha.png',
    invertLogo: true,
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
    logo: '/logos/thor.png',
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
    logo: '/logos/pantera.png',
  },
  {
    path: '/estudos',
    label: 'Estudos',
    icon: GraduationCap,
    implemented: true,
    description: 'Matérias e progresso',
    color: '#4caf50',
    hero: 'Bruce Banner',
    emblem: 'flask',
    logo: '/logos/hulk.png',
  },
  {
    path: '/saude',
    label: 'Saúde',
    icon: HeartPulse,
    implemented: true,
    description: 'Rotina e bem-estar',
    color: '#ff7ac0',
    hero: 'Guardiões da Galáxia',
    emblem: 'guardians',
    logo: '/logos/guardioes.png',
  },
  {
    path: '/notas',
    label: 'Notas',
    icon: StickyNote,
    implemented: true,
    description: 'Informações importantes',
    color: '#f5c33b',
    hero: 'Visão',
    emblem: 'gem',
    logo: '/logos/visao.png',
  },
  {
    path: '/assistente',
    label: 'Assistente',
    icon: Sparkles,
    implemented: true,
    description: 'Seu esquadrão de IA',
    color: '#ffa63f',
    hero: 'F.R.I.D.A.Y.',
    emblem: 'core',
    logo: '/logos/friday.png',
  },
  {
    path: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    implemented: true,
    description: 'Preferências do sistema',
    color: '#4a8fe0',
    hero: 'Quarteto Fantástico',
    emblem: 'four',
    logo: '/logos/quarteto.png',
  },
]

export function findModule(pathname: string): NavItem | undefined {
  return MODULES.find((m) => pathname === m.path || pathname.startsWith(m.path + '/'))
}
