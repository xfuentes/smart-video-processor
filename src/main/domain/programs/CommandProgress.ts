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

import { Processes } from '../../util/processes'
import { ChildProcess } from 'node:child_process'
import { currentSettings, defaultSettings } from '../Settings'
import { ProcessesPriority } from '../../../common/@types/processes'

type CommandResult = {
  response: string
  error?: string
}

export abstract class CommandProgress {
  protected readonly command: string
  protected readonly successCodes: number[]
  protected readonly abortCode?: number
  private readonly versionArgs?: string[]
  private readonly versionPattern?: RegExp

  protected constructor(
    command: string,
    successCodes: number[],
    abortCode?: number,
    versionArgs?: string[],
    versionPattern?: RegExp
  ) {
    this.command = command
    this.successCodes = successCodes
    this.abortCode = abortCode
    this.versionArgs = versionArgs
    this.versionPattern = versionPattern
  }

  public async getVersion(): Promise<string> {
    if (this.versionArgs && this.versionPattern) {
      const versionOutputInterpreter = (stdout?: string, _stderr?: string, _process?: ChildProcess) => {
        let ver: string = ''
        if (stdout != undefined) {
          const versionMatches = this.versionPattern?.exec(stdout)
          if (versionMatches?.groups) {
            ver = versionMatches?.groups.version
          }
        }
        return {
          response: ver
        }
      }
      return await this.execute(this.versionArgs, versionOutputInterpreter)
    } else {
      return Promise.reject(new Error(`Version Retrieval Not Supported Yet`))
    }
  }

  protected execute(
    args: string[],
    outputInterpreter: (stdin?: string, stdout?: string, process?: ChildProcess) => CommandResult
  ): Promise<string> {
    return new Promise((resolve: (data: string) => void, reject: (reason: Error) => void) => {
      const process = Processes.spawn(this.command, args, { stdio: ['pipe', 'pipe', 'pipe'] })
      outputInterpreter(undefined, undefined, process)
      if (process.pid) {
        Processes.setPriority(process.pid, ProcessesPriority[currentSettings.priority ?? defaultSettings.priority])
      }
      const result: CommandResult = { response: '' }
      if (process?.stdout) {
        process.stdout.on('data', (data: string | Buffer) => {
          const stdoutResult = outputInterpreter(data.toString(), undefined, process)
          if (stdoutResult.response) {
            result.response = stdoutResult.response
          } else if (stdoutResult.error) {
            result.error = stdoutResult.error
          }
        })
      }
      if (process?.stderr) {
        process.stderr.on('data', (data: string | Buffer) => {
          const errResult = outputInterpreter(undefined, data.toString(), process)
          if (result.error === undefined && errResult.error) {
            result.error = errResult.error
          }
        })
      }
      process?.on('close', (code: number, signal: string) => {
        if (signal === 'SIGTERM' || code === this.abortCode) {
          reject(new Error('Aborted'))
        } else if (this.successCodes.includes(code)) {
          resolve(result.response)
        } else {
          reject(new Error(result.error ?? 'Unexpected error.'))
        }
      })
      process?.on('error', (err: { code: string; path: string; message: string }) => {
        let reason: string
        switch (err.code) {
          case 'ENOENT':
            reason = `Command "${err.path}" not found.`
            break
          default:
            reason = err.message
        }
        reject(new Error(reason))
      })
    })
  }
}
