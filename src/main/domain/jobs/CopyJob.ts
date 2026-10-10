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

import fs from 'node:fs'
import path from 'node:path'
import { _ } from '../../i18n'
import { Job } from './Job'
import { JobStatus } from '../../../common/@types/Job'

// Large chunks keep network shares fast.
const COPY_CHUNK_SIZE = 16 * 1024 * 1024

export class CopyJob extends Job<string> {
  private readonly sourcePath: string
  private readonly destinationPath: string
  private readStream?: fs.ReadStream
  private writeStream?: fs.WriteStream
  private isAborted: boolean = false

  constructor(sourcePath: string, destinationPath: string) {
    super(JobStatus.MERGING, _('job.title.copying', { defaultValue: 'Copying file' }))
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
  }

  abort() {
    this.isAborted = true
    this.readStream?.destroy(new Error('Aborted'))
    this.writeStream?.destroy(new Error('Aborted'))
  }

  protected async executeInternal(): Promise<string> {
    const totalSize = (await fs.promises.stat(this.sourcePath)).size
    await fs.promises.mkdir(path.dirname(this.destinationPath), { recursive: true })
    try {
      await this.copy(totalSize)
    } catch (error) {
      await fs.promises.rm(this.destinationPath, { force: true })
      throw this.isAborted ? 'Aborted' : error
    }
    return this.destinationPath
  }

  private copy(totalSize: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let copied = 0
      this.readStream = fs.createReadStream(this.sourcePath, { highWaterMark: COPY_CHUNK_SIZE })
      this.writeStream = fs.createWriteStream(this.destinationPath, { highWaterMark: COPY_CHUNK_SIZE })
      this.readStream.on('data', (chunk) => {
        copied += chunk.length
        this.setProgression({ progress: totalSize > 0 ? Math.floor((copied / totalSize) * 1000) / 1000 : undefined })
      })
      this.readStream.on('error', reject)
      this.writeStream.on('error', reject)
      this.writeStream.on('close', () => (this.isAborted ? reject(new Error('Aborted')) : resolve()))
      this.readStream.pipe(this.writeStream)
    })
  }
}
