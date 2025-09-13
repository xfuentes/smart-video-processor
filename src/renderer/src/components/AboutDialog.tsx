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
const version = window.api.main.version
import ElectronLogo from '../assets/electron.svg'
import FluentLogo from '../assets/fluent.svg'
import ViteLogo from '../assets/vite.svg'
import MKVToolNixLogo from '../assets/mkvtoolnix.png'
import FFmpegLogo from '../assets/ffmpeg.png'

export const AboutDialog = () => {
  const [selectedTab, setSelectedTab] = useState('license')
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
        <DialogBody style={{ gap: 0, flexGrow: 1, minHeight: '500px', maxHeight: '500px' }}>
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
                      height: '250px',
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
                      height: '250px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px',
                      border: '1px solid #EBEBEB'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <table style={{ textSizeAdjust: 'auto', width: '100%' }}>
                        <tr>
                          <td>
                            <img src={ElectronLogo} width={24} />
                          </td>
                          <td>
                            Electron (
                            <Link onClick={() => window.open('https://www.electronjs.org/fr/', '_blank')}>
                              https://www.electronjs.org/fr/
                            </Link>
                            )
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src={FluentLogo} width={24} />
                          </td>
                          <td>
                            Fluent UI React (
                            <Link onClick={() => window.open('https://github.com/microsoft/fluentui', '_blank')}>
                              https://github.com/microsoft/fluentui
                            </Link>
                            )
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src={ViteLogo} width={24} />
                          </td>
                          <td>
                            Vite (
                            <Link onClick={() => window.open('https://vite.dev/', '_blank')}>https://vite.dev/</Link>)
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src={MKVToolNixLogo} width={24} />
                          </td>
                          <td>
                            MKVToolNix (
                            <Link
                              onClick={() =>
                                window.open('https://www.matroska.org/downloads/mkvtoolnix.html', '_blank')
                              }
                            >
                              https://www.matroska.org/downloads/mkvtoolnix.html
                            </Link>
                            )
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src={FFmpegLogo} width={24} />
                          </td>
                          <td>
                            FFmpeg (
                            <Link onClick={() => window.open('https://ffmpeg.org/', '_blank')}>
                              https://ffmpeg.org/
                            </Link>
                            ,&nbsp;
                            <Link onClick={() => window.open('https://www.gyan.dev/ffmpeg/builds/', '_blank')}>
                              Download
                            </Link>
                            )
                          </td>
                        </tr>
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
