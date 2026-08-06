import fs from 'node:fs'
import path from 'node:path'

/**
 * Tokenize an ICU message into literal and placeholder segments.
 * Top-level `{...}` blocks are treated as placeholders, including nested ones.
 */
export function tokenize(str) {
  const tokens = []
  let i = 0
  while (i < str.length) {
    if (str[i] === '{') {
      const start = i
      let depth = 1
      i++
      while (i < str.length && depth > 0) {
        const c = str[i]
        if (c === '{') depth++
        else if (c === '}') depth--
        i++
      }
      tokens.push({ type: 'placeholder', raw: str.slice(start, i) })
    } else {
      const start = i
      while (i < str.length && str[i] !== '{') {
        i++
      }
      tokens.push({ type: 'literal', raw: str.slice(start, i) })
    }
  }
  return tokens
}

/**
 * Extract top-level ICU placeholder strings from a message.
 */
export function extractPlaceholders(str) {
  return tokenize(str)
    .filter((t) => t.type === 'placeholder')
    .map((t) => t.raw)
}

/**
 * Restore the placeholder names from `source` into `target` while keeping
 * the translated literal text. This fixes Google Translate mangling of
 * ICU variables such as `{value}` -> `{valeur}`.
 *
 * If the placeholder count differs, the target is returned as-is and a
 * warning is printed because the translation has broken the ICU skeleton.
 */
export function restorePlaceholders(source, target, { key, locale } = {}) {
  const sourceTokens = tokenize(source)
  const targetTokens = tokenize(target)
  const sourcePlaceholders = sourceTokens.filter((t) => t.type === 'placeholder')
  const targetPlaceholders = targetTokens.filter((t) => t.type === 'placeholder')

  if (sourcePlaceholders.length !== targetPlaceholders.length) {
    const ctx = key && locale ? ` for "${key}" in ${locale}` : ''
    console.warn(`Warning: placeholder count mismatch${ctx}. Skipping restore.`)
    return target
  }

  let placeholderIndex = 0
  let result = ''
  for (const token of targetTokens) {
    if (token.type === 'placeholder') {
      result += sourcePlaceholders[placeholderIndex].raw
      placeholderIndex++
    } else {
      result += token.raw
    }
  }

  return result
}

export function readJson(file) {
  const text = fs.readFileSync(file, 'utf8')
  return JSON.parse(text)
}

export function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
  JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function listLocales(localesDir) {
  return fs
    .readdirSync(localesDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({ name, path: path.join(localesDir, name), lang: path.basename(name, '.json') }))
}
