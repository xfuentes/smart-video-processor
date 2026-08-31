/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import axios, { AxiosAdapter, AxiosResponse, getAdapter, InternalAxiosRequestConfig } from 'axios'

const RECORDING = process.env.RECORD_HTTP === '1'
const RECORDINGS_DIR = path.resolve(__dirname, '../resources/http-recordings')

function requestKey(config: InternalAxiosRequestConfig): string {
  const url = new URL(config.url ?? '', config.baseURL ?? '').toString()
  const params = new URLSearchParams(config.params).toString()
  const body = typeof config.data === 'string' ? config.data : ''
  const key = `${config.method ?? 'get'}:${url}?${params}:${body}`
  return createHash('md5').update(key).digest('hex')
}

const defaultAdapter = getAdapter('http')

export const recordedHttpAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const key = requestKey(config)
  const file = path.join(RECORDINGS_DIR, `${key}.json`)

  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: undefined
    } as AxiosResponse
  }

  if (!RECORDING) {
    throw new Error(`No recorded HTTP response for ${config.method ?? 'get'} ${config.url}`)
  }

  const response = (await defaultAdapter(config)) as AxiosResponse
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(response.data, null, 2))

  return response
}

axios.defaults.adapter = recordedHttpAdapter
