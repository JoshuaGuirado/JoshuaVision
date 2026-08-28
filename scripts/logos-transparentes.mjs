/**
 * Tira o fundo das logos que o Joshua salvou em public/herois/.
 *
 * As imagens vieram com fundos diferentes (branco, preto e o xadrez de
 * "transparência" chapado no JPG). O script parte das bordas e vai apagando
 * tudo que for parecido com a cor de fundo, sem entrar no desenho — assim
 * nenhuma parte da arte é comida por engano.
 *
 * Saída: public/logos/<nome>.png, já recortado no conteúdo.
 */
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'public/herois'
const OUT = 'public/logos'

const TOL_HARD = 46 // até aqui é fundo puro: some
const TOL_SOFT = 105 // zona da borda serrilhada: fica meio transparente

function dist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

async function processar(file) {
  const src = path.join(SRC, file)
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: W, height: H, channels: C } = info
  const at = (x, y) => (y * W + x) * C

  // Cores de fundo: amostradas ao longo de toda a borda (o xadrez tem duas).
  const bg = []
  const addBg = (x, y) => {
    const i = at(x, y)
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    if (!bg.some((c) => dist(r, g, b, c[0], c[1], c[2]) < 30)) bg.push([r, g, b])
  }
  for (let x = 0; x < W; x += Math.max(1, Math.floor(W / 64))) {
    addBg(x, 0)
    addBg(x, H - 1)
  }
  for (let y = 0; y < H; y += Math.max(1, Math.floor(H / 64))) {
    addBg(0, y)
    addBg(W - 1, y)
  }

  const perto = (i) => {
    let min = Infinity
    for (const c of bg) {
      const d = dist(data[i], data[i + 1], data[i + 2], c[0], c[1], c[2])
      if (d < min) min = d
    }
    return min
  }

  // Preenchimento a partir das bordas (fila, não recursão: imagem grande
  // estouraria a pilha).
  const visto = new Uint8Array(W * H)
  const fila = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const p = y * W + x
    if (visto[p]) return
    visto[p] = 1
    fila.push(p)
  }
  for (let x = 0; x < W; x++) {
    push(x, 0)
    push(x, H - 1)
  }
  for (let y = 0; y < H; y++) {
    push(0, y)
    push(W - 1, y)
  }

  while (fila.length) {
    const p = fila.pop()
    const x = p % W
    const y = (p / W) | 0
    const i = p * C
    const d = perto(i)

    if (d < TOL_HARD) {
      data[i + 3] = 0
      push(x + 1, y)
      push(x - 1, y)
      push(x, y + 1)
      push(x, y - 1)
    } else if (d < TOL_SOFT) {
      // borda serrilhada: transparência proporcional, sem avançar mais
      const a = (d - TOL_HARD) / (TOL_SOFT - TOL_HARD)
      data[i + 3] = Math.min(data[i + 3], Math.round(255 * a))
    }
  }

  const nome = file.replace(/^logo/, '').replace(/-1\.jpg$/, '') + '.png'
  await mkdir(OUT, { recursive: true })
  await sharp(data, { raw: { width: W, height: H, channels: C } })
    .png()
    .trim({ threshold: 1 })
    .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(OUT, nome))

  console.log(`${file} -> logos/${nome}  (fundos detectados: ${bg.length})`)
}

const files = (await readdir(SRC)).filter((f) => f.startsWith('logo') && f.endsWith('.jpg'))
for (const f of files) await processar(f)
console.log('\nPronto:', files.length, 'logos')
