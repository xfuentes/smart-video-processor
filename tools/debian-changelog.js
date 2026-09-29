/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import packageJSON from '../package.json' with { type: 'json' }

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(rootDir, 'dist', 'debian-changelog')
const maintainer = 'Xavier Fuentes <xfuentes-dev@serviam.cc>'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formats a YYYY-MM-DD date as an RFC 2822 date at midnight UTC.
const rfc2822 = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00Z`)
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${WEEKDAYS[date.getUTCDay()]}, ${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} 00:00:00 +0000`
}

// Converts a markdown bullet into plain text for the Debian changelog.
const plainText = (text) => text.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1')

// Parses CHANGELOG.md into released versions with their bullets, ignoring the Unreleased section.
const parseReleases = (markdown) => {
  const releases = []
  let current
  for (const line of markdown.split('\n')) {
    const heading = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/.exec(line)
    if (heading) {
      current = { version: heading[1], date: heading[2], items: [] }
      releases.push(current)
    } else if (line.startsWith('## ')) {
      current = undefined
    } else if (current && line.startsWith('- ')) {
      current.items.push(plainText(line.slice(2).trim()))
    }
  }
  return releases
}

const releases = parseReleases(fs.readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8'))
const output = releases
  .map((release) => {
    const items = release.items.map((item) => `  * ${item}`).join('\n')
    return `${packageJSON.name} (${release.version}) stable; urgency=medium\n\n${items}\n\n -- ${maintainer}  ${rfc2822(release.date)}\n`
  })
  .join('\n')

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, output)
console.log(`Generated: ${outputPath} (${releases.length} releases)`)
