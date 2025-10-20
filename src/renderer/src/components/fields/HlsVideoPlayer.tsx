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

import React, { useEffect, useRef } from 'react'
import Hls, { HlsConfig } from 'hls.js'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'

interface ElectronHlsPlayerProps {
  src: string
  autoPlay?: boolean
  width?: string
  height?: string
  className?: string
}

const HlsVideoPlayer: React.FC<ElectronHlsPlayerProps> = ({
  src,
  autoPlay = true,
  width = '100%',
  height = '100%',
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { setVideoRef } = useVideoPlayer()

  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    console.log('setting videoRef to ' + videoRef)
    setVideoRef(videoRef)
  }, [setVideoRef, videoRef])

  useEffect(() => {
    let hls: Hls | null = null

    const initPlayer = () => {
      if (videoRef.current) {
        const video = videoRef.current

        // Electron-optimized configuration
        const config: Partial<HlsConfig> = {
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          // Electron-specific optimizations
          progressive: true,
          // Improved loading for local network streams common in Electron apps
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 20000,
          levelLoadingTimeOut: 20000
        }

        if (Hls.isSupported()) {
          hls = new Hls(config)
          hlsRef.current = hls
          console.log('loading video from: ' + src)
          hls.loadSource(src)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
              video.play().catch((e) => {
                console.error('Autoplay failed:', e)
                // Electron apps often need user interaction first
                console.log('Please click play to start video')
              })
            }
          })

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...')
                  hls?.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...')
                  hls?.recoverMediaError()
                  break
                default:
                  console.error('Fatal error, cannot recover')
                  hls?.destroy()
                  break
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Fallback for Electron's Chromium-based player
          console.log('using fallback')
          video.src = src
          if (autoPlay) {
            video.play().catch((e) => console.error('Autoplay failed:', e))
          }
        }
      }
    }

    initPlayer()

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoPlay])

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      className={className}
      controls
      style={{
        objectFit: 'scale-down',
        backgroundColor: '#000'
      }}
    />
  )
}

export default HlsVideoPlayer
