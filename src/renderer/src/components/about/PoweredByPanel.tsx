/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import React, { useEffect, useState } from 'react'
import { Link } from '@fluentui/react-components'
import { useI18n } from '../../i18n'

import ElectronLogo from '../../assets/electron.svg'
import FluentLogo from '../../assets/fluent.svg'
import ViteLogo from '../../assets/vite.svg'
import MKVToolNixLogo from '../../assets/mkvtoolnix.png'
import FFmpegLogo from '../../assets/ffmpeg.png'
import TMDBLogo from '../../assets/tmdb.svg'
import TVDBLogo from '../../assets/tvdb.svg'
import NODEJSLogoDark from '../../assets/Node.js-dark.svg'
import NODEJSLogoLight from '../../assets/Node.js-light.svg'

const otherVersions = window.electron.process.versions

function getIsDark(): boolean {
  const dark = window.matchMedia('(prefers-color-scheme: dark)')
  const light = window.matchMedia('(prefers-color-scheme: light)')
  return dark.matches || !light.matches
}

export const PoweredByPanel = (): React.JSX.Element => {
  const _ = useI18n()
  const [isDark, setIsDark] = useState(getIsDark)

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    const light = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setIsDark(getIsDark())
    dark.addEventListener('change', handler)
    light.addEventListener('change', handler)
    return () => {
      dark.removeEventListener('change', handler)
      light.removeEventListener('change', handler)
    }
  }, [])

  return (
    <div
      style={{
        backgroundColor: 'var(--colorNeutralBackground2)',
        height: '360px',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '5px',
        border: '1px solid var(--colorNeutralStroke1)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <table
          style={{
            textSizeAdjust: 'auto',
            width: '100%',
            border: 'none',
            borderCollapse: 'collapse'
          }}
        >
          <tbody className={'powered-by-list'}>
            <tr>
              <td>
                <img
                  src={MKVToolNixLogo}
                  width={48}
                  alt={_('about.powered.mkvtoolnix.alt', { defaultValue: 'MKVToolNix Logo' })}
                />
              </td>
              <td>MKVToolNix</td>
              <td className="version">{window.api.main.mkvmergeVersion}</td>
              <td>
                <Link onClick={() => window.open('https://www.matroska.org/downloads/mkvtoolnix.html', '_blank')}>
                  https://www.matroska.org/downloads
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  style={{ backgroundColor: 'rgb(3, 37, 65)', padding: '2px' }}
                  src={TMDBLogo}
                  width={48}
                  alt={_('about.powered.tmdb.alt', { defaultValue: 'TMDB Logo' })}
                />
              </td>
              <td>The Movie DB</td>
              <td className="version">3</td>
              <td>
                <Link onClick={() => window.open('https://www.themoviedb.org/', '_blank')}>
                  https://www.themoviedb.org/
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <img src={FFmpegLogo} width={48} alt={_('about.powered.ffmpeg.alt', { defaultValue: 'FFmpeg Logo' })} />
              </td>
              <td>FFmpeg</td>
              <td className="version">{window.api.main.ffmpegVersion}</td>
              <td>
                <Link onClick={() => window.open('https://ffmpeg.org/', '_blank')}>https://ffmpeg.org/</Link>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  style={{ backgroundColor: 'black', padding: '2px' }}
                  src={TVDBLogo}
                  width={48}
                  alt={_('about.powered.tvdb.alt', { defaultValue: 'TVDB Logo' })}
                />
              </td>
              <td>The TVDB</td>
              <td className="version">4</td>
              <td>
                <Link onClick={() => window.open('https://thetvdb.com/', '_blank')}>https://thetvdb.com/</Link>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  src={isDark ? NODEJSLogoDark : NODEJSLogoLight}
                  width={48}
                  alt={_('about.powered.nodejs.alt', { defaultValue: 'Node.js Logo' })}
                />
              </td>
              <td>Node.js</td>
              <td className="version">{otherVersions.node}</td>
              <td>
                <Link onClick={() => window.open('https://nodejs.org/', '_blank')}>https://nodejs.org/</Link>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  src={ElectronLogo}
                  width={48}
                  alt={_('about.powered.electron.alt', { defaultValue: 'Electron Logo' })}
                />
              </td>
              <td>Electron</td>
              <td className="version">{otherVersions.electron}</td>
              <td>
                <Link onClick={() => window.open('https://www.electronjs.org/', '_blank')}>
                  https://www.electronjs.org/
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <img src={FluentLogo} width={48} alt={_('about.powered.fluent.alt', { defaultValue: 'Fluent Logo' })} />
              </td>
              <td>Fluent UI React </td>
              <td className="version">{window.api.main.fluentUIVersion}</td>
              <td>
                <Link onClick={() => window.open('https://github.com/microsoft/fluentui', '_blank')}>
                  https://github.com/microsoft/fluentui
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <img src={ViteLogo} width={48} alt={_('about.powered.vite.alt', { defaultValue: 'Vite Logo' })} />
              </td>
              <td>Vite</td>
              <td className="version">{window.api.main.viteVersion}</td>
              <td>
                <Link onClick={() => window.open('https://vite.dev/', '_blank')}>https://vite.dev/</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
