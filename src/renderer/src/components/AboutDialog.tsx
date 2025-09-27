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

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTrigger,
  Link,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  ToolbarButton
} from '@fluentui/react-components'
import React, { useState } from 'react'
import { ArchiveSettings20Regular, CalendarInfoRegular, DocumentSettings20Regular } from '@fluentui/react-icons'
import { LicenseText } from '@renderer/components/LicenseTest'
import ElectronLogo from '../assets/electron.svg'
import FluentLogo from '../assets/fluent.svg'
import ViteLogo from '../assets/vite.svg'
import MKVToolNixLogo from '../assets/mkvtoolnix.png'
import FFmpegLogo from '../assets/ffmpeg.png'
import TMDBLogo from '../assets/tmdb.svg'
import TVDBLogo from '../assets/tvdb.svg'
import NODEJSLogo from '../assets/Node.js.svg'

const version = window.api.main.version
const otherVersions = window.electron.process.versions

export const AboutDialog = () => {
  const [selectedTab, setSelectedTab] = useState('powered')
  const [opened, setOpened] = useState(false)

  const handleOpenChange = (_event, data) => {
    setOpened(data.open)
  }

  const handleClose = (_ev: React.FormEvent) => {
    setOpened(false)
  }

  return (
    <Dialog modalType="modal" open={opened} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <ToolbarButton vertical icon={<CalendarInfoRegular />}>
          About
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface aria-label="About" style={{ padding: '5px', display: 'flex', flexFlow: 'column' }}>
        <DialogBody style={{ gap: 0, flexGrow: 1, minHeight: '600px', maxHeight: '500px' }}>
          <DialogContent className="settings-dialog">
            <div className="vertical-stack">
              <h3 style={{ textAlign: 'center' }}>Smart Video Processor v{version}</h3>
              <p style={{ fontSize: 'small' }}>
                This small application in JavaScript is a frontend for various great free command line tools. Its
                purpose is to help process and encode your DVD or Blu-ray backups. Please visit this project{' '}
                <Link onClick={() => window.open('https://github.com/xfuentes/smart-video-processor', '_blank')}>
                  homepage
                </Link>
                .
              </p>
              <div style={{ fontSize: 'smaller' }}>
                Copyright (c) 2025. Xavier Fuentes&nbsp;
                <Link
                  style={{ fontSize: 'smaller' }}
                  onClick={() => window.open('mailto://xfuentes-dev@hotmail.com', '_blank')}
                >
                  &lt;xfuentes-dev@hotmail.com&gt;
                </Link>
              </div>
              <br />
              <TabList
                selectedValue={selectedTab}
                size="small"
                onTabSelect={(_event: SelectTabEvent, data: SelectTabData) => setSelectedTab(data.value as string)}
              >
                <Tab value="powered" icon={<ArchiveSettings20Regular />}>
                  Powered by
                </Tab>
                <Tab value="license" icon={<DocumentSettings20Regular />}>
                  License
                </Tab>
              </TabList>
              <div>
                {selectedTab === 'license' && (
                  <div
                    style={{
                      height: '360px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px',
                      border: '1px solid #EBEBEB'
                    }}
                  >
                    <h3 style={{ textAlign: 'center' }}>GNU GENERAL PUBLIC LICENSE</h3>
                    <LicenseText />
                  </div>
                )}
                {selectedTab === 'powered' && (
                  <div
                    style={{
                      backgroundColor: '#f5f5f5',
                      height: '360px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px',
                      border: '1px solid #EBEBEB'
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
                              <img src={MKVToolNixLogo} width={48} alt={'MKVToolNix Logo'} />
                            </td>
                            <td>MKVToolNix</td>
                            <td className="version">{window.api.main.mkvmergeVersion}</td>
                            <td>
                              <Link
                                onClick={() =>
                                  window.open('https://www.matroska.org/downloads/mkvtoolnix.html', '_blank')
                                }
                              >
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
                                alt={'TMDB Logo'}
                              />
                            </td>
                            <td>The Movie DB</td>
                            <td>3</td>
                            <td>
                              <Link onClick={() => window.open('https://www.themoviedb.org/', '_blank')}>
                                https://www.themoviedb.org/
                              </Link>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <img src={FFmpegLogo} width={48} alt={'FFmpeg Logo'} />
                            </td>
                            <td>FFmpeg</td>
                            <td className="version">{window.api.main.ffmpegVersion}</td>
                            <td>
                              <Link onClick={() => window.open('https://ffmpeg.org/', '_blank')}>
                                https://ffmpeg.org/
                              </Link>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <img
                                style={{ backgroundColor: 'black', padding: '2px' }}
                                src={TVDBLogo}
                                width={48}
                                alt={'TVDB Logo'}
                              />
                            </td>
                            <td>The TVDB</td>
                            <td className="version">4</td>
                            <td>
                              <Link onClick={() => window.open('https://thetvdb.com/', '_blank')}>
                                https://thetvdb.com/
                              </Link>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <img src={NODEJSLogo} width={48} alt={'Node.js Logo'} />
                            </td>
                            <td>Node.js</td>
                            <td className="version">{otherVersions.node}</td>
                            <td>
                              <Link onClick={() => window.open('https://nodejs.org/', '_blank')}>
                                https://nodejs.org/
                              </Link>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <img src={ElectronLogo} width={48} alt={'Electron Logo'} />
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
                              <img src={FluentLogo} width={48} alt={'Fluent Logo'} />
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
                              <img src={ViteLogo} width={48} alt={'Vite Logo'} />
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
                )}
              </div>
            </div>
          </DialogContent>
          <DialogActions style={{ paddingTop: '10px' }}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={handleClose}>
                Close
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
