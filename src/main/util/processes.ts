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

import { SpawnOptionsWithStdioTuple, StdioPipe } from 'child_process'
import * as child_process from 'node:child_process'
import { ChildProcess, ChildProcessWithoutNullStreams } from 'node:child_process'
import lcid from 'lcid'
import { debug } from './log'
import * as os from 'node:os'
import * as fs from 'node:fs'
import { Dict, ProcessEnv, ProcessesPriority } from '../../common/@types/processes'
import { app } from 'electron'

const defaultOptions = { spawn: true }
const defaultLocale = 'en-US'
const cache = new Map()

export class Processes {
  private static readonly isUsingWindows = process.platform === 'win32'

  static spawn(
    command: string,
    args: readonly string[],
    options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
  ): ChildProcessWithoutNullStreams {
    debug('Spawning ' + command + ' ' + args.map((arg) => (arg.indexOf(' ') != -1 ? '"' + arg + '"' : arg)).join(' '))
    return child_process.spawn(command, args, options)
  }

  static async pause(proc: ChildProcess) {
    if (proc.pid != undefined) {
      if (process.platform === 'win32') {
        // @ts-ignore ntsuspend only available on windows
        const ntsuspend = await import('ntsuspend')
        ntsuspend && ntsuspend.suspend(proc.pid)
      } else {
        proc.kill('SIGSTOP')
      }
    }
  }

  static async resume(proc: ChildProcess) {
    if (proc.pid != undefined) {
      if (process.platform === 'win32') {
        // @ts-ignore ntsuspend only available on windows
        const ntsuspend = await import('ntsuspend')
        ntsuspend && ntsuspend.resume(proc.pid)
      } else {
        proc.kill('SIGCONT')
      }
    }
  }

  static commandExistsSync(commandName: string) {
    const cleanedCommandName = this.cleanInput(commandName)

    if (this.isUsingWindows) {
      return this.commandExistsWindowsSync(commandName, cleanedCommandName)
    } else {
      return this.commandExistsUnixSync(commandName, cleanedCommandName)
    }
  }

  static findCommandSync(commandName: string, fallbackCommandPath: string): string {
    const path = this.commandExistsSync(commandName)
    return path || fallbackCommandPath
  }

  static async spawnReadStdout(command: string, args: string[]): Promise<string> {
    return new Promise<string>((resolve: (result: string) => void, reject: (reason: string) => void) => {
      let result = ''
      const cProcess = Processes.spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] })
      if (cProcess?.stdout) {
        cProcess.stdout.on('data', (data: string | Buffer) => {
          if (data) {
            result += data.toString()
          }
        })
      }
      cProcess?.on('close', () => {
        resolve(result)
      })
      cProcess?.on('error', reject)
    })
  }

  static isLimitedPermissions = (): boolean => {
    return app?.getPath('exe').includes('/snap/') || false
  }

  static setPriority(pid: number, priority: ProcessesPriority) {
    if (!this.isLimitedPermissions()) {
      let priorityNum = os.constants.priority.PRIORITY_BELOW_NORMAL
      switch (priority) {
        case ProcessesPriority.LOW:
          priorityNum = os.constants.priority.PRIORITY_LOW
          break
        case ProcessesPriority.BELOW_NORMAL:
          priorityNum = os.constants.priority.PRIORITY_BELOW_NORMAL
          break
        case ProcessesPriority.NORMAL:
          priorityNum = os.constants.priority.PRIORITY_NORMAL
          break
        case ProcessesPriority.ABOVE_NORMAL:
          priorityNum = os.constants.priority.PRIORITY_ABOVE_NORMAL
          break
        case ProcessesPriority.HIGH:
          priorityNum = os.constants.priority.PRIORITY_HIGH
          break
      }
      debug('Set priority: ' + pid + ' priority: ' + priorityNum)
      os.setPriority(pid, priorityNum)
    }
  }

  static isWindowsPlatform() {
    const name = os.platform()
    return name !== 'darwin' && name !== 'linux'
  }

  public static normalise(input: string) {
    return input.replace(/_/, '-')
  }

  /**
   * Retrieve Current Locale (copied from os-locale package because modern import failed with nw.js)
   * @param options
   */
  public static osLocaleSync(options = defaultOptions): string {
    if (cache.has(options.spawn)) {
      return cache.get(options.spawn)
    }

    let locale: string | undefined
    try {
      const envLocale = this.getEnvLocale()

      if (envLocale || !options.spawn) {
        locale = this.getLocale(envLocale)
      } else if (process.platform === 'win32') {
        locale = this.getWinLocaleSync()
      } else if (process.platform === 'darwin') {
        locale = this.getAppleLocaleSync()
      } else {
        locale = this.getUnixLocaleSync()
      }
    } catch {
      /* empty */
    }

    const normalised = this.normalise(locale || defaultLocale)
    cache.set(options.spawn, normalised)
    return normalised
  }

  private static cleanInput(s: string) {
    if (/[^A-Za-z0-9_/:=-]/.test(s)) {
      s = "'" + s.replace(/'/g, "'\\''") + "'"
      s = s
        .replace(/^(?:'')+/g, '') // remove duplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'") // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    return s
  }

  private static fileNotExistsSync(commandName: string) {
    try {
      fs.accessSync(commandName, fs.constants.F_OK)
      return false
    } catch (e) {
      return true
    }
  }

  private static localExecutableSync(commandName: string) {
    try {
      fs.accessSync(commandName, fs.constants.F_OK | fs.constants.X_OK)
      return true
    } catch (e) {
      return false
    }
  }

  private static commandExistsUnixSync(commandName: string, cleanedCommandName: string) {
    if (this.fileNotExistsSync(commandName)) {
      try {
        const stdout = child_process.execSync('command -v ' + cleanedCommandName)
        return stdout.toString().trim()
      } catch (error) {
        return ''
      }
    }
    return this.localExecutableSync(commandName) ? commandName : ''
  }

  private static commandExistsWindowsSync(commandName: string, cleanedCommandName: string) {
    // Regex from Julio from: https://stackoverflow.com/questions/51494579/regex-windows-path-validator
    if (!/^(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:[^<>:"|?*\n]+(?:\/\/|\/|\\\\|\\)?)+$/m.test(commandName)) {
      return false
    }
    try {
      return child_process
        .execSync('where ' + cleanedCommandName, { stdio: [] })
        .toString()
        .split('\n')[0]
        .trim()
    } catch (error) {
      return ''
    }
  }

  private static parseLocale(string: string) {
    const env: Dict<string> = {}
    for (const definition of string.split('\n')) {
      const [key, value] = definition.split('=')
      env[key] = value.replace(/^"|"$/g, '')
    }

    return this.getEnvLocale(env)
  }

  private static getStdOutSync(file: string, args?: readonly string[]) {
    return child_process
      .execFileSync(file, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      })
      .toString()
      .trim()
  }

  private static getWinLocaleSync() {
    const stdout = this.getStdOutSync('wmic', ['os', 'get', 'locale'])
    const lcidCode = Number.parseInt(stdout.replace('Locale', ''), 16)

    return lcid.from(lcidCode)
  }

  private static getUnixLocaleSync() {
    return this.getLocale(this.parseLocale(this.getStdOutSync('locale')))
  }

  private static getLocalesSync() {
    return this.getStdOutSync('locale', ['-a'])
  }

  private static getSupportedLocale(locale: string, locales = '') {
    return locales.includes(locale) ? locale : defaultLocale
  }

  private static getAppleLocaleSync() {
    return this.getSupportedLocale(
      this.getStdOutSync('defaults', ['read', '-globalDomain', 'AppleLocale']),
      this.getLocalesSync()
    )
  }

  private static getLocale(string: string | undefined) {
    return string?.replace(/[.:].*/, '')
  }

  private static getEnvLocale(env: ProcessEnv = process.env) {
    return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE
  }
}
