// Converts the publisher's card images (see app/src/images/README.md).
// sharp is not a project dependency: copy this file into a scratch folder, run `npm i sharp@0.34` there, then
//   node convert-cards.mjs "<publisher folder>/misc/Sources/cartes PNG 2026" <repo>/app/src/images
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const [src, dst] = process.argv.slice(2)
const source = (n) => path.join(src, `cartes-carrees-Elementis-2026_${n}.png`)

// The 12 powers of the game (P-6, P-11 and P-14 are removed). Element faces: Water = P + 1, Air = P + 16, Fire = P + 31, Earth = P + 46.
const powers = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 15]
const elementOffsets = { water: 1, air: 16, fire: 31, earth: 46 }
// Power faces are not in the order of the powers.
const powerFaces = { 1: 63, 2: 64, 3: 62, 4: 65, 5: 66, 7: 68, 8: 69, 9: 70, 10: 71, 12: 72, 13: 73, 15: 76 }

let total = 0
async function convert(n, out) {
  const file = path.join(dst, out)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await sharp(source(n)).resize(600, 600).webp({ quality: 90, effort: 6 }).toFile(file)
  total += fs.statSync(file).size
}

for (const power of powers) {
  for (const [element, offset] of Object.entries(elementOffsets)) await convert(power + offset, `cards/elements/${element}-${power}.webp`)
  await convert(powerFaces[power], `cards/powers/power-${power}.webp`)
}
await convert(107, 'cards/elementis.webp')
console.log(`${powers.length * 5 + 1} images, ${(total / 1e6).toFixed(2)} MB`)
