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

import axios, { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createCachingAdapter } from '../../../src/main/domain/clients/SimpleCachingAdapter'
import { RateLimiter } from '../../../src/main/domain/clients/RateLimiter'

const originalAdapter = axios.defaults.adapter

const okResponse = (config: InternalAxiosRequestConfig) =>
  ({ data: 'ok', status: 200, statusText: 'OK', headers: {}, config }) as AxiosResponse

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
})

afterEach(() => {
  axios.defaults.adapter = originalAdapter
})

test('A failed request is not cached so the next identical request is sent again', async () => {
  let calls = 0
  const network: AxiosAdapter = async (config) => {
    calls++
    if (calls === 1) {
      throw new Error('network down')
    }
    return okResponse(config)
  }
  axios.defaults.adapter = network
  const client = axios.create({ baseURL: 'https://example.test', adapter: createCachingAdapter(new RateLimiter(1000)) })

  await expect(client.get('/failing-once')).rejects.toThrow('network down')
  const response = await client.get('/failing-once')
  expect(response.data).toBe('ok')
  expect(calls).toBe(2)
})

test('A successful request is cached', async () => {
  let calls = 0
  axios.defaults.adapter = async (config) => {
    calls++
    return okResponse(config)
  }
  const client = axios.create({ baseURL: 'https://example.test', adapter: createCachingAdapter(new RateLimiter(1000)) })

  await client.get('/cached')
  await client.get('/cached')
  expect(calls).toBe(1)
})
