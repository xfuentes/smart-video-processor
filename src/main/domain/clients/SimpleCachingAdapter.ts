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

import axios, { AxiosAdapter, AxiosResponse, getAdapter, InternalAxiosRequestConfig } from 'axios'
import { RateLimiter } from './RateLimiter'
import { debug } from '../../util/log'

const cache = new Map<string, Promise<AxiosResponse>>()

function generateKey(config: InternalAxiosRequestConfig): string {
  const url = config.url || ''
  const baseUrl = config.baseURL || ''
  const params = new URLSearchParams(config.params).toString()
  const method = config.method || 'get'
  const language = String(config.headers?.get?.('Accept-Language') ?? '')
  return `${method}:${baseUrl}${url}?${params}:${language}`
}

// Only real network calls are slowed down, cached responses are returned immediately.
export const createCachingAdapter =
  (rateLimiter: RateLimiter): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const key = generateKey(config)

    if (cache.has(key)) {
      debug('log.cache.reading', { defaultValue: '{key} -> READING FROM CACHE', key })
      return cache.get(key)!
    } else {
      debug('log.cache.caching', { defaultValue: '{key} -> CACHING RESPONSE', key })
    }

    const defaultAdapter = getAdapter(axios.defaults.adapter)
    const response = rateLimiter.slows().then(() => defaultAdapter(config))
    cache.set(key, response)
    return response
  }
