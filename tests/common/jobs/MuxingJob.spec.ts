/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { expect, test } from 'vitest'
import { MuxingJob } from '../../../src/main/domain/jobs/MuxingJob'
import { JobManager } from '../../../src/main/domain/jobs/JobManager'
import { JobStatus } from '../../../src/common/@types/Job'

test('Muxing jobs run one at a time in their own queue and show the message of the step', async () => {
  const order: string[] = []
  let release: () => void = () => {}
  const first = new MuxingJob('first', async ({ setMessage }) => {
    order.push('first start')
    setMessage('Cutting 50%')
    await new Promise<void>((resolve) => (release = resolve))
    order.push('first end')
    return 1
  })
  const second = new MuxingJob('second', async () => {
    order.push('second start')
    return 2
  })

  const firstResult = first.queue()
  const secondResult = second.queue()
  await Promise.resolve()

  expect(first.getStatus()).toBe(JobStatus.MUXING)
  expect(first.getStatusMessage()).toBe('Cutting 50%')
  expect(second.getStatus()).toBe(JobStatus.QUEUED)
  expect(JobManager.getInstance().getQueueInfo(JobStatus.MUXING)).toMatchObject({ running: true, queued: 1 })

  release()
  expect(await firstResult).toBe(1)
  expect(await secondResult).toBe(2)
  expect(order).toStrictEqual(['first start', 'first end', 'second start'])
})
