import { useState } from 'react'

/**
 * SALVAR SEM SUMIR EM SILÊNCIO.
 *
 * Todo formulário do site faz a mesma dança: marca "salvando", chama o banco,
 * fecha. O problema é o caminho do erro — quando a sessão expira ou a internet
 * cai, a promessa falha e o formulário fica parado em "Salvando..." sem dizer
 * nada. Foi exatamente isso que aconteceu ao criar a primeira conta.
 *
 * Este gancho embrulha a chamada: em caso de erro ele destrava o botão e
 * devolve uma mensagem para a tela mostrar.
 */
export function useSalvar() {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /** Roda `acao`; devolve `true` se deu certo. */
  async function salvar(acao: () => Promise<void>): Promise<boolean> {
    if (salvando) return false
    setSalvando(true)
    setErro(null)
    try {
      await acao()
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setErro(
        msg.includes('sessão')
          ? msg
          : 'Não consegui salvar. Confira a internet e tente de novo.',
      )
      return false
    } finally {
      setSalvando(false)
    }
  }

  return { salvando, erro, salvar }
}
