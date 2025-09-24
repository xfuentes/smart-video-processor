/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import * as fs from 'node:fs'
import { PathLike, WriteFileOptions } from 'node:fs'
import http from 'node:http'
import { debug } from './log'
import path from 'node:path'
import * as https from 'node:https'
import * as tmp from 'tmp'
import { globSync } from 'glob'

export class Files {
  static loadTextFileSync(dir: string, name: string, encoding: BufferEncoding = 'utf8'): string | undefined {
    const filename = path.join(dir, name)
    try {
      debug('Loading file ' + filename)
      fs.accessSync(filename, fs.constants.R_OK)
      const buffer = fs.readFileSync(filename)
      return buffer.toString(encoding)
    } catch (err) {
      console.log(err)
    }
    return undefined
  }

  static writeFile(
    dir: string,
    name: string,
    data: string | Buffer = '',
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const filename = path.join(dir, name)
      fs.writeFile(filename, data, encoding, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          return reject(err)
        }
        resolve(filename)
      })
    })
  }

  static writeFileSync(
    dir: string,
    name: string,
    data: string | Buffer = '',
    encoding: WriteFileOptions | undefined = 'utf8'
  ) {
    const filename = path.join(dir, name)
    debug('Writing file ' + filename)
    fs.writeFileSync(filename, data, encoding)
  }

  static makeTempFile(template: string, noCreate: boolean = false): string {
    tmp.setGracefulCleanup()
    const out = tmp.fileSync({ template: 'svp-XXXXXX-' + template, discardDescriptor: true })
    if (noCreate) {
      out.removeCallback()
    }
    return out.name
  }

  /**
   * Cleanup files matching fullPathPattern (supported glob style patterns)
   * @param fullPathPattern
   */
  static cleanupFiles(fullPathPattern: string) {
    const filesToClean = globSync(fullPathPattern)
    filesToClean.forEach((file) => {
      fs.unlinkSync(file)
    })
  }

  static cleanupTempPaths(template: string) {
    const tempPath = path.join(process.cwd())
    if (fs.existsSync(tempPath)) {
      fs.readdirSync(tempPath).forEach((file: string) => {
        if (file.startsWith(template)) {
          const curPath = path.join(tempPath, file)
          this.deleteFolderRecursive(curPath)
        }
      })
    }
  }

  static deleteFolderRecursive(inPath: string) {
    if (fs.existsSync(inPath)) {
      fs.readdirSync(inPath).forEach((file: string) => {
        const curPath = path.join(inPath, file)
        if (fs.lstatSync(curPath).isDirectory()) {
          Files.deleteFolderRecursive(curPath)
        } else {
          Files.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(inPath)
    }
  }

  static unlinkSync(inPath: PathLike) {
    fs.unlinkSync(inPath)
  }

  static removeSpecialCharsFromFilename(filename: string): string {
    filename = filename.replace(/:/g, '։') // U+0589
    filename = filename.replace(/\?\?/g, '⁇') // U+2047
    filename = filename.replace(/!\?/g, '⁉') // U+2049
    filename = filename.replace(/\?!/g, '⁈') // U+2048
    filename = filename.replace(/\?/g, '﹖') // U+FF1F
    filename = filename.replace(/!/g, 'ǃ') // U+01C3
    filename = filename.replace(/"/g, '”') // U+201D
    filename = filename.replace(/\*/g, '🟉') // U+1F7C9
    filename = filename.replace(/\//g, '∕') // U+2215
    return filename
  }

  static restoreSpecialCharsFromFilename(filename: string) {
    filename = filename.replace(/\u0589/g, ':')
    filename = filename.replace(/\u2047/g, '??')
    filename = filename.replace(/\u2049/g, '!?')
    filename = filename.replace(/\u2048/g, '?!')
    filename = filename.replace(/\uFF1F/g, '?')
    filename = filename.replace(/\u01C3/g, '!')
    filename = filename.replace(/\u201D/g, '"')
    filename = filename.replace(/\u1F7C9/g, '*')
    filename = filename.replace(/\u2215/g, '/')
    return filename
  }

  static cleanFilename(filename: string) {
    const pos: number = filename.lastIndexOf('.')
    if (pos > 0) {
      // Remove extension
      filename = filename.substring(0, pos)
    }

    if (filename.split(' ').length < 3) {
      filename = filename.replace(/[.\-_]/gu, ' ')
    }
    filename = filename.replace(/^epz-/i, '')
    filename = filename.replace(/\s+/g, ' ').trim()

    return this.restoreSpecialCharsFromFilename(filename)
  }

  static megaTrim(input: string) {
    input = input.replace(/^[.\-_\s]*/, '')
    input = input.replace(/[.\-_\s]*$/, '')
    return input
  }

  static extractArgs(args: string[]) {
    let escape = false
    let instr = false
    const arr: string[] = []
    let arg = ''
    for (const c of args) {
      if (!escape) {
        if (c === '"') {
          instr = !instr
        } else if (c === '\\') {
          escape = true
        } else if (c === ' ') {
          if (!instr) {
            arr.push(arg)
            arg = ''
          } else {
            arg += c
          }
        } else {
          arg += c
        }
      } else {
        if (c === '"' || c === '\\') {
          arg += c
        } else {
          arg += '\\' + c
        }
        escape = false
      }
    }
    if (arg) {
      arr.push(arg)
    }
    return arr
  }

  static downloadFile(url: string, fullPath: string, fd?: number | fs.promises.FileHandle): Promise<string> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(fullPath, { fd })

      https
        .get(url, (response: http.IncomingMessage) => {
          response.pipe(file)
          file.on('finish', () => {
            file.close(() => {
              resolve(fullPath)
            })
          })
        })
        .on('error', (err: Error) => {
          fs.unlink(fullPath, () => {
            console.log(err)
            reject(new Error('Error downloading file. ' + err.message))
          })
        })
    })
  }

  static fileExistsAndIsReadable(path: PathLike): boolean {
    try {
      fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK)
      return true
    } catch (err) {
      return false
    }
  }
}
