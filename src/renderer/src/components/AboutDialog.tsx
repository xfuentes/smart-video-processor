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
import {
  ArchiveSettings20Regular,
  CalendarInfoRegular,
  ClipboardBulletList20Regular,
  DocumentSettings20Regular,
  News20Regular
} from '@fluentui/react-icons'
import { LicenseText } from '@renderer/components/LicenseTest'
import { _ } from '../i18n'
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
  const [selectedTab, setSelectedTab] = useState('news')
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
          {_('about.trigger.label', { defaultValue: 'About' })}
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface
        aria-label={_('about.aria_label', { defaultValue: 'About' })}
        style={{ padding: '5px', display: 'flex', flexFlow: 'column', minWidth: '650px' }}
      >
        <DialogBody style={{ gap: 0, flexGrow: 1, minHeight: '600px', maxHeight: '700px' }}>
          <DialogContent className="settings-dialog">
            <div className="vertical-stack">
              <h3 style={{ textAlign: 'center', marginBlockStart: 0, marginBlockEnd: 0 }}>
                {_('about.title', { defaultValue: 'Smart Video Processor v{version}', version })}
              </h3>
              <p style={{ fontSize: 'small' }}>
                {_('about.description', {
                  defaultValue:
                    'This tool automatically identifies your movies and TV shows using popular databases, then streamlines the entire process: rename files using Plex-friendly conventions, attach artwork, correct metadata (including track language and type), split or join media files and encode to H.264 or H.265—all in one place.'
                })}
                <br />
                <Link onClick={() => window.open('https://github.com/xfuentes/smart-video-processor', '_blank')}>
                  {_('about.visit_project_homepage', { defaultValue: 'Please visit the project homepage.' })}
                </Link>
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
                <Tab value="news" icon={<News20Regular />}>
                  {_('about.tab.news', { defaultValue: "What''s new" })}
                </Tab>
                <Tab value="features" icon={<ClipboardBulletList20Regular />}>
                  {_('about.tab.features', { defaultValue: 'Features' })}
                </Tab>
                <Tab value="powered" icon={<ArchiveSettings20Regular />}>
                  {_('about.tab.powered_by', { defaultValue: 'Powered by' })}
                </Tab>
                <Tab value="license" icon={<DocumentSettings20Regular />}>
                  {_('about.tab.license', { defaultValue: 'License' })}
                </Tab>
              </TabList>
              <div>
                {selectedTab === 'news' && (
                  <div
                    style={{
                      height: '360px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px',
                      border: '1px solid #EBEBEB'
                    }}
                  >
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.0' })}</h4>
                    <ul>
                      {_('about.news.version_1_8_0.items', {
                        defaultValue:
                          'Added full app translation support with 24 locales\nNew language settings and IETF-aware search\nImproved locale fallback and robustness for settings loading'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.7.2' })}</h4>
                    <ul>
                      {_('about.news.version_1_7_2.items', {
                        defaultValue:
                          'Reworked filename parser for more reliable movie and TV show identification\nAdded JDownloader EventScripter integration for automated download handling\nImproved build and packaging workflows\nVarious bug fixes and UI polish'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.7.1' })}</h4>
                    <ul>
                      {_('about.news.version_1_7_1.items', {
                        defaultValue:
                          'Fixed default search mode when parsing movie and TV show filenames\nFixed series poster being downloaded to the wrong or duplicate location\nImproved track language detection when using manual hints\nUI consistency improvements for settings and multi-file matching'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.7.0' })}</h4>
                    <ul>
                      {_('about.news.version_1_7_0.items', {
                        defaultValue:
                          'Redesigned TV show matching with more search options (by title, TVDB ID, episode number or episode name)\nImproved episode matching for absolute-numbered series\nBetter handling of missing or not-found episodes with clearer messages'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.8' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_8.items', { defaultValue: 'Fix security issues' })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.7' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_7.items', {
                        defaultValue: 'Fix preview not showing regression\nNew packaging to fix security issues'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.5' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_5.items', {
                        defaultValue:
                          'Fix issues with track encoding selection\nShow mixed selection if different data on multi select'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.4' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_4.items', {
                        defaultValue:
                          'Improve absolute episode number matching (good for mangas)\nImprove UI performance\nResponse caching for TVDB and TMDB'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.3' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_3.items', {
                        defaultValue:
                          'Re-encode on Codec Mismatch Setting\nFix issue with multi encode\nFix matching of series even if no episode number specified'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.2' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_2.items', {
                        defaultValue:
                          'Support drag and drop movie parts\nDisplay progression while generating preview\nHigh speed conversion of files if format is not supported for preview\nFixed issue with second part joining and trimming'
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.1' })}</h4>
                    <ul>
                      {_('about.news.version_1_6_1.items', {
                        defaultValue:
                          "Display a warning message if application can''t access removable medias (snap)\nAdded What''s new section in about dialog\nAdded Features section in about dialog"
                      })
                        .split('\n')
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {selectedTab === 'features' && (
                  <div
                    style={{
                      height: '360px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px',
                      border: '1px solid #EBEBEB'
                    }}
                  >
                    <ul>
                      <li>
                        <b>
                          {_('about.features.automatic_media_recognition.title', {
                            defaultValue: 'Automatic Media Recognition:'
                          })}
                        </b>{' '}
                        <small>
                          {_('about.features.automatic_media_recognition.description', {
                            defaultValue: 'Identifies movies and TV shows using TheMovieDB or TVDB'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>{_('about.features.smart_file_renaming.title', { defaultValue: 'Smart File Renaming:' })}</b>{' '}
                        <small>
                          {_('about.features.smart_file_renaming.description', {
                            defaultValue: 'Renames files using Plex/Kodi-friendly naming conventions'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>{_('about.features.metadata_correction.title', { defaultValue: 'Metadata Correction:' })}</b>{' '}
                        <small>
                          {_('about.features.metadata_correction.description', {
                            defaultValue: 'Fetches and corrects title, year, episode name...'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>
                          {_('about.features.audio_subtitle_management.title', {
                            defaultValue: 'Audio & Subtitle Track Management:'
                          })}
                        </b>{' '}
                        <small>
                          {_('about.features.audio_subtitle_management.description', {
                            defaultValue: 'Detects and labels audio/subtitle languages; renames and reorders tracks.'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>
                          {_('about.features.poster_thumbnail_download.title', {
                            defaultValue: 'Poster & Thumbnail Download:'
                          })}
                        </b>{' '}
                        <small>
                          {_('about.features.poster_thumbnail_download.description', {
                            defaultValue: 'Automatically downloads posters and thumbnails.'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>
                          {_('about.features.media_splitting_joining.title', {
                            defaultValue: 'Media File Splitting & Joining:'
                          })}
                        </b>{' '}
                        <small>
                          {_('about.features.media_splitting_joining.description', {
                            defaultValue: 'Splits large files or joins multiple parts (e.g., DVD1/DVD2) into one.'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>
                          {_('about.features.video_encoding.title', {
                            defaultValue: 'Video Encoding (H.264 / H.265):'
                          })}
                        </b>{' '}
                        <small>
                          {_('about.features.video_encoding.description', {
                            defaultValue: 'Converts media to efficient formats with predefined presets.'
                          })}
                        </small>
                      </li>
                      <li>
                        <b>{_('about.features.batch_processing.title', { defaultValue: 'Batch Processing:' })}</b>{' '}
                        <small>
                          {_('about.features.batch_processing.description', {
                            defaultValue: 'Handles multiple files simultaneously with queue management.'
                          })}
                        </small>
                      </li>
                    </ul>
                  </div>
                )}
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
                              <img
                                src={MKVToolNixLogo}
                                width={48}
                                alt={_('about.powered.mkvtoolnix.alt', { defaultValue: 'MKVToolNix Logo' })}
                              />
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
                              <img
                                src={FFmpegLogo}
                                width={48}
                                alt={_('about.powered.ffmpeg.alt', { defaultValue: 'FFmpeg Logo' })}
                              />
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
                                alt={_('about.powered.tvdb.alt', { defaultValue: 'TVDB Logo' })}
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
                              <img
                                src={NODEJSLogo}
                                width={48}
                                alt={_('about.powered.nodejs.alt', { defaultValue: 'Node.js Logo' })}
                              />
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
                              <img
                                src={FluentLogo}
                                width={48}
                                alt={_('about.powered.fluent.alt', { defaultValue: 'Fluent Logo' })}
                              />
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
                              <img
                                src={ViteLogo}
                                width={48}
                                alt={_('about.powered.vite.alt', { defaultValue: 'Vite Logo' })}
                              />
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
              <Button size="small" appearance="secondary" onClick={handleClose}>
                {_('about.close', { defaultValue: 'Close' })}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
