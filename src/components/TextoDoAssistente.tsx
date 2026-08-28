import { Fragment, type ReactNode } from 'react'

/**
 * Texto das respostas do assistente.
 *
 * Os modelos escrevem em Markdown por hábito, então "**R$ 100,00**" chegava com
 * os asteriscos à mostra. Em vez de pedir para eles não usarem (o que falha de
 * vez em quando), a marcação simples é convertida aqui: negrito, itálico e
 * `código`. Nada além disso — é um balão de conversa, não um documento.
 */

type Pedaco = { tipo: 'texto' | 'negrito' | 'italico' | 'codigo'; valor: string }

/**
 * Quebra a linha nos marcadores. A ordem importa: `**` precisa ser testado
 * antes de `*`, senão o negrito viraria dois itálicos vazios.
 */
function separar(linha: string): Pedaco[] {
  const pedacos: Pedaco[] = []
  // Cada alternativa captura o conteúdo entre os marcadores.
  const padrao = /\*\*(.+?)\*\*|__(.+?)__|`([^`]+?)`|(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g

  let ultimo = 0
  for (const m of linha.matchAll(padrao)) {
    const indice = m.index ?? 0
    if (indice > ultimo) pedacos.push({ tipo: 'texto', valor: linha.slice(ultimo, indice) })

    if (m[1] !== undefined) pedacos.push({ tipo: 'negrito', valor: m[1] })
    else if (m[2] !== undefined) pedacos.push({ tipo: 'negrito', valor: m[2] })
    else if (m[3] !== undefined) pedacos.push({ tipo: 'codigo', valor: m[3] })
    else if (m[4] !== undefined) pedacos.push({ tipo: 'italico', valor: m[4] })

    ultimo = indice + m[0].length
  }

  if (ultimo < linha.length) pedacos.push({ tipo: 'texto', valor: linha.slice(ultimo) })
  return pedacos
}

function renderizar(pedaco: Pedaco, chave: number): ReactNode {
  switch (pedaco.tipo) {
    case 'negrito':
      return (
        <strong key={chave} className="font-semibold">
          {pedaco.valor}
        </strong>
      )
    case 'italico':
      return <em key={chave}>{pedaco.valor}</em>
    case 'codigo':
      return (
        <code key={chave} className="px-1 py-0.5 rounded bg-black/25 text-[0.92em]">
          {pedaco.valor}
        </code>
      )
    default:
      return <Fragment key={chave}>{pedaco.valor}</Fragment>
  }
}

export default function TextoDoAssistente({ texto }: { texto: string }) {
  const linhas = texto.split('\n')

  return (
    <>
      {linhas.map((linha, i) => {
        // "- item" e "* item" viram marcador de lista, não itálico.
        const item = /^\s*[-*•]\s+(.*)$/.exec(linha)
        const conteudo = item ? item[1] : linha

        return (
          <Fragment key={i}>
            {i > 0 && <br />}
            {item && <span className="text-text-faint">• </span>}
            {separar(conteudo).map(renderizar)}
          </Fragment>
        )
      })}
    </>
  )
}
