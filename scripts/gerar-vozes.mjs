/**
 * GERA AS VOZES DOS HERÓIS, UMA VEZ SÓ.
 *
 * O problema: a voz do navegador muda de aparelho para aparelho. O iPhone do
 * Joshua só oferece voz feminina, o computador dele tem duas — então o mesmo
 * herói soava diferente em cada lugar.
 *
 * A solução: gerar os áudios aqui, no computador, e guardá-los no site. Todo
 * aparelho toca o mesmo arquivo, então o Thor soa igual em qualquer lugar.
 *
 * Como rodar (precisa da GOOGLE_API_KEY no .env.local):
 *
 *     npm install --no-save @breezystack/lamejs
 *     node scripts/gerar-vozes.mjs
 *
 * Só gera o que ainda não existe. Para refazer uma fala, apague o .mp3 dela
 * em public/vozes/ e rode de novo.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
// O pacote 'lamejs' original quebra no Node ('MPEGMode is not defined'); este
// fork corrigido é o mesmo codificador, sem o bug.
const lamejs = require('@breezystack/lamejs')

const SAIDA = 'public/vozes'
// O áudio cru fica guardado aqui: se a conversão falhar, não gastamos de novo
// a cota da API só para baixar o mesmo som.
const CACHE = 'scripts/.cache-vozes'
const MODELO = 'gemini-2.5-flash-preview-tts'

/**
 * A voz de cada herói e como ele deve soar.
 *
 * `voz` é uma das vozes prontas do Gemini; `estilo` é a instrução de atuação
 * que vai junto com a fala — é o que separa o trovão do Thor da pressa do
 * Homem-Aranha.
 */
const ELENCO = {
  '/hoje': { id: 'vingadores', voz: 'Alnilam', estilo: 'em tom firme e heroico, como um líder reunindo a equipe' },
  '/agenda': { id: 'estranho', voz: 'Sadaltager', estilo: 'em tom misterioso e pausado, como um mago que conhece o tempo' },
  '/financas': { id: 'capitao', voz: 'Orus', estilo: 'em tom firme, sério e encorajador, como um capitão do exército' },
  '/tarefas': { id: 'ferro', voz: 'Puck', estilo: 'em tom rápido, confiante e irônico, como um bilionário espirituoso' },
  '/metas': { id: 'aranha', voz: 'Fenrir', estilo: 'em tom jovem, animado e acelerado, como um adolescente empolgado' },
  '/habitos': { id: 'thor', voz: 'Algenib', estilo: 'em tom grave, solene e grandioso, como um deus do trovão' },
  '/projetos': { id: 'pantera', voz: 'Charon', estilo: 'em tom grave, calmo e majestoso, como um rei' },
  '/estudos': { id: 'banner', voz: 'Iapetus', estilo: 'em tom calmo, contido e gentil, como um cientista tímido' },
  '/saude': { id: 'guardioes', voz: 'Zubenelgenubi', estilo: 'em tom descontraído e brincalhão' },
  '/notas': { id: 'visao', voz: 'Erinome', estilo: 'em tom sereno, preciso e levemente artificial' },
  '/assistente': { id: 'friday', voz: 'Aoede', estilo: 'em tom leve e prestativo, como uma assistente digital' },
  '/configuracoes': { id: 'quarteto', voz: 'Sulafat', estilo: 'em tom caloroso e animado' },
}

/** Mesma limpeza que o site faz antes de falar (siglas, moeda, símbolos). */
function paraFala(texto) {
  return texto
    .replace(/F\.?R\.?I\.?D\.?A\.?Y\.?/gi, 'Fraidei')
    .replace(/R\$\s*(-?[\d.,]+)/g, '$1 reais')
    .replace(/(\d)\s*%/g, '$1 por cento')
    .replace(/\bIA\b/g, 'inteligência artificial')
    .replace(/\s*[—–]\s*/g, ', ')
}

/** Lê as falas direto do heroVoice.ts, para não haver duas listas para manter. */
async function lerFalas() {
  const fonte = await readFile('src/lib/heroVoice.ts', 'utf8')
  const falas = {}

  for (const [rota, elenco] of Object.entries(ELENCO)) {
    const inicio = fonte.indexOf(`  '${rota}': {`)
    if (inicio < 0) throw new Error(`não achei o herói de ${rota} em heroVoice.ts`)
    const fim = fonte.indexOf('\n  },', inicio)
    const bloco = fonte.slice(inicio, fim)

    const saudacao = bloco.match(/greeting:\s*\n?\s*'((?:[^'\\]|\\.)*)'/)?.[1]
    const linhas = [...(bloco.match(/lines: \[([\s\S]*?)\]/)?.[1] ?? '').matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(
      (m) => m[1],
    )
    if (!saudacao) throw new Error(`não achei a saudação de ${rota}`)

    falas[rota] = { ...elenco, textos: [saudacao, ...linhas].map((t) => t.replace(/\\'/g, "'")) }
  }
  return falas
}

/** Chama o Gemini e devolve o PCM cru (24 kHz, 16 bits, mono). */
async function gerarPcm(texto, voz, estilo, chave) {
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Fale ${estilo}: ${texto}` }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } },
        },
      }),
    },
  )

  if (!resposta.ok) {
    const corpo = await resposta.text()
    throw new Error(`${resposta.status}: ${corpo.slice(0, 200)}`)
  }
  const json = await resposta.json()
  const parte = json.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!parte) throw new Error('a resposta veio sem áudio')
  return Buffer.from(parte.data, 'base64')
}

/** PCM cru vira MP3: 320 KB por fala viraria peso demais no site. */
function paraMp3(pcm, taxa = 24000, kbps = 56) {
  const amostras = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2)
  const codificador = new lamejs.Mp3Encoder(1, taxa, kbps)
  const pedacos = []
  const BLOCO = 1152

  for (let i = 0; i < amostras.length; i += BLOCO) {
    const buf = codificador.encodeBuffer(amostras.subarray(i, i + BLOCO))
    if (buf.length) pedacos.push(Buffer.from(buf))
  }
  const fim = codificador.flush()
  if (fim.length) pedacos.push(Buffer.from(fim))
  return Buffer.concat(pedacos)
}

// ---------------------------------------------------------------------------

const env = await readFile('.env.local', 'utf8')
const chave = env.match(/GOOGLE_API_KEY=(.+)/)?.[1]?.trim()
if (!chave) {
  console.error('Falta GOOGLE_API_KEY no .env.local')
  process.exit(1)
}

await mkdir(SAIDA, { recursive: true })
await mkdir(CACHE, { recursive: true })
const falas = await lerFalas()
const manifesto = {}
let geradas = 0
let reaproveitadas = 0
let semCota = false

for (const [, { id, voz, estilo, textos }] of Object.entries(falas)) {
  for (const [i, texto] of textos.entries()) {
    const arquivo = `${id}-${i}.mp3`
    const destino = path.join(SAIDA, arquivo)
    const cru = path.join(CACHE, `${id}-${i}.pcm`)
    manifesto[texto] = `/vozes/${arquivo}`

    if (existsSync(destino)) {
      reaproveitadas++
      continue
    }
    if (semCota) {
      delete manifesto[texto]
      continue
    }

    process.stdout.write(`${id}-${i} (${voz})... `)
    try {
      let pcm
      if (existsSync(cru)) {
        // já baixado numa tentativa anterior: converte sem gastar cota
        pcm = await readFile(cru)
        process.stdout.write('(do cache) ')
      } else {
        pcm = await gerarPcm(paraFala(texto), voz, estilo, chave)
        // grava o cru ANTES de converter: se a conversão falhar, a cota que
        // já foi gasta não se perde junto
        await writeFile(cru, pcm)
      }

      const mp3 = paraMp3(pcm)
      await writeFile(destino, mp3)
      console.log(`${(mp3.length / 1024).toFixed(0)} KB`)
      geradas++
    } catch (erro) {
      const mensagem = String(erro.message)
      console.log(`FALHOU — ${mensagem.slice(0, 120)}`)
      delete manifesto[texto]

      // Cota estourada: insistir só queima o resto da lista com erro. Para
      // aqui e o Joshua roda de novo quando a cota voltar (ela é diária).
      if (mensagem.startsWith('429')) {
        console.log('\n>> Cota da API esgotada. Rode de novo mais tarde: o que já foi gerado é reaproveitado.')
        semCota = true
        continue
      }
    }
    // respiro entre chamadas: a API tem limite por minuto
    await new Promise((r) => setTimeout(r, 1200))
  }
}

await writeFile('src/lib/vozes.json', JSON.stringify(manifesto, null, 2) + '\n')

const arquivos = await readdir(SAIDA)
console.log(
  `\n${geradas} geradas, ${reaproveitadas} já existiam. ` +
    `${arquivos.length} arquivos em ${SAIDA}/, manifesto em src/lib/vozes.json`,
)
