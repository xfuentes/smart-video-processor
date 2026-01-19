/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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
import { debug } from '../../util/log'

const cache = new Map<string, Promise<AxiosResponse>>()

function generateKey(config: InternalAxiosRequestConfig): string {
  const url = config.url || ''
  const baseUrl = config.baseURL || ''
  const params = new URLSearchParams(config.params).toString()
  const method = config.method || 'get'
  return `${method}:${baseUrl}${url}?${params}`
}

export const simpleCachingAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> => {
  const key = generateKey(config)

  if (cache.has(key)) {
    debug(`${key} -> READING FROM CACHE`)
    return cache.get(key)!
  } else {
    debug(`${key} -> CACHING RESPONSE`)
  }

  const defaultAdapter = getAdapter(axios.defaults.adapter)
  const response = defaultAdapter(config)
  cache.set(key, response)
  return response
}
