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

import React from 'react'
import { useI18n } from '../../i18n'

export const NewsPanel = (): React.JSX.Element => {
  const _ = useI18n()

  return (
    <div
      style={{
        backgroundColor: 'var(--colorNeutralBackground1)',
        height: '360px',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '5px',
        border: '1px solid var(--colorNeutralStroke1)',
        boxSizing: 'border-box'
      }}
    >
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.9.3' })}</h4>
      <ul>
        {_('about.news.version_1_9_3.items', {
          defaultValue:
            'Fixed Flathub builds by skipping Git LFS in the Flatpak manifest\nFixed AppStream validation by removing invalid content rating IDs'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.9.2' })}</h4>
      <ul>
        {_('about.news.version_1_9_2.items', {
          defaultValue:
            'Added -n/--new-instance command-line argument to allow running a new app instance\nAdded -h/--help command-line argument to display the version, description and accepted arguments'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.9.1' })}</h4>
      <ul>
        {_('about.news.version_1_9_1.items', {
          defaultValue:
            'Added the Flatpak application icon and multi-arch packaging for x86_64 and aarch64\nImproved the binary download script to skip files already present locally\nUpdated the video player loading screen to a black background with white text\nFixed the Flatpak desktop entry categories, MIME types and keywords formatting'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.9.0' })}</h4>
      <ul>
        {_('about.news.version_1_9_0.items', {
          defaultValue:
            'Added system dark mode support with theme-aware icons\nAdded Flatpak packaging with a host-filesystem permission banner\nReworked the Output Rules settings with an editable, drag-and-drop list and new matching operators\nAdded a Do not show again option and copy-to-clipboard command for permission warnings\nReorganized the Settings dialog into tabs for easier navigation'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.9' })}</h4>
      <ul>
        {_('about.news.version_1_8_9.items', {
          defaultValue:
            'Fixed filename parsing for movie titles containing bracketed release tags such as [REMASTERED]\nImproved reliability of automatic source file deletion by falling back to permanent delete when the system trash is unavailable'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.8' })}</h4>
      <ul>
        {_('about.news.version_1_8_8.items', {
          defaultValue:
            'Added automatic "Spectacle" genre detection for live performances (one-man show, stand-up comedy, theater play, concert, live performance, etc.) when retrieving movie details from TMDB\nCleanup progress dialog now uses translated messages and the correct application icon'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.7' })}</h4>
      <ul>
        {_('about.news.version_1_8_7.items', {
          defaultValue:
            "Added a cleanup progress dialog that shows the deletion progress of temporary files when closing the application\nFixed escaped newlines in the What's New list for version 1.8.5 so each item renders as a separate bullet"
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.6' })}</h4>
      <ul>
        {_('about.news.version_1_8_6.items', {
          defaultValue:
            'Fixed a Fluent UI runtime error that could break the About and other dialogs\nUpdated the JDownloader integration to support both Linux and Windows and to launch Smart Video Processor in the background\nImproved dependency resolution for Fluent UI and build tooling'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.5' })}</h4>
      <ul>
        {_('about.news.version_1_8_5.items', {
          defaultValue:
            'The Cancel toolbar action now also removes selected videos that are waiting in the queue and resets them to the ready-to-process state\nThe application log viewer is now available in a new "Logs" tab in the About dialog instead of the main toolbar\nVideo status messages (info, warning and error) are now also emitted to the event log\nCustom videos now display a warning asking the user to complete the required information before processing\nMulti-search now continues with the remaining selected videos if one search fails, preventing the multi-selection panels from staying disabled\nAuto-start mode is now disabled for videos that have been canceled or manually searched, preventing them from automatically processing again'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.4' })}</h4>
      <ul>
        {_('about.news.version_1_8_4.items', {
          defaultValue:
            'Added a shutdown button to the main toolbar to turn off the computer when all processing is complete\nAdded an option to delete source files after they are processed\nAdded Arabic (ar-SA) to the Microsoft Store listing\nDeclared all 23 supported languages in the Windows Store package\nEncoding job progress messages are now translated based on the selected language\nTV shows using absolute episode numbering are no longer placed in a season subfolder\nPinned taskbar icons no longer duplicate when launching the Microsoft Store version from the Start menu'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.3' })}</h4>
      <ul>
        {_('about.news.version_1_8_3.items', {
          defaultValue:
            'Added Output Rules to route processed videos to custom directories based on type, language, year, genres, country or quality\nImproved filename parsing for franchise-style movie titles with a year separator\nFixed language matching for output rules so a region-less code like fr correctly matches fr-FR'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.2' })}</h4>
      <ul>
        {_('about.news.version_1_8_2.items', {
          defaultValue:
            'Opening a video file from the Windows right-click menu now works for the Microsoft Store version\nNow only the language selector in Settings shows the English name of each language next to its translation'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.8.1' })}</h4>
      <ul>
        {_('about.news.version_1_8_1.items', {
          defaultValue:
            'Fixed missing translations in packaged builds\nImproved language selector sorting\nImproved TV show matching and episode position display'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
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
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.6.0' })}</h4>
      <ul>
        {_('about.news.version_1_6_0.items', {
          defaultValue: 'Added Multi edit tv shows for fast matching\nAdded Mass TV Series Episode edition'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.10' })}</h4>
      <ul>
        {_('about.news.version_1_5_10.items', {
          defaultValue: 'Fixed Wrong codec in target filename'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.9' })}</h4>
      <ul>
        {_('about.news.version_1_5_9.items', {
          defaultValue: 'Fixed Old files loading issue'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.5' })}</h4>
      <ul>
        {_('about.news.version_1_5_5.items', {
          defaultValue:
            "Added Open files with drag drop or button and settings dialog\nAdded Rest of UI\nAdded External program path settings\nAdded Settings validation at startup\nAdded About dialog\nAdded 'other' video type.\nAdded Banner and remove update check on linux\nAdded New processing tab\nAdded Beginning of processing tab\nAdded Display video previews with ruler\nAdded Video preview display\nAdded Split and concat code 1/2\nAdded Remove part button, improve setStartFrom and setEndAt\nAdded New temp directory setting\nImproved Preview matching and tracks\nImproved Video codec setting to auto.\nImproved Tmp files handling and cleanup\nImproved Version retriever 1/2\nImproved Display ffmpeg and mkvmerge versions in about dialog\nImproved Separate list and video listeners for better update mechanism\nImproved UI responsiveness\nDisabled Controls when encoding\nImproved Movie name matching\nImproved Snapshot at load time and retrieve keyframes only when needed\nImproved User entered year if not found in DB\nImproved Ffmpeg mkvmerge and ffprobe published with application and setting removed\nFixed Connect UI to controller with IPC and fix windows packaging\nFixed Settings update and x265 encoding on linux\nFixed Pause/unpause, cancel and process icon disabled issue\nFixed Mkvmerge language argument inconsistency\nFixed Other type of videos\nFixed Two pass encoding for x264 and x265\nFixed X265 encoding on windows\nFixed Disk space issue because of tmp files\nFixed Clear button wrongly staying disabled\nFixed Div hights\nFixed Shm issue with snaps\nFixed Startup issue if program missing\nFixed Loading issue with snap version\nFixed To allow entering year when not in DB\nFixed Display issue in matching tab\nFixed Workaround ffmpeg MJPEG attachment issue\nFixed Test and fix trim and concat\nFixed Intermittent issue detecting ffmpeg path with snaps\nFixed Mapping and cleanup temp files\nFixed Auto selection of tracks issue\nFixed Issue with tvShow episode search\nFixed Issue with language selector and improve display of snapshots\nFixed Language selector bug\nFixed Poster not showing on some systems\nFixed Issue running commands with symbolic link\nFixed Find executable path and taking snapshot issue\nFixed Issue when no overviews present in tv show search results\nFixed Workaround issue with electron-builder 26 on linux\nFixed Linux packaging, fix merge not returning errors"
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.4' })}</h4>
      <ul>
        {_('about.news.version_1_5_4.items', {
          defaultValue: 'Fixed Issue when no overviews present in tv show search results'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.3' })}</h4>
      <ul>
        {_('about.news.version_1_5_3.items', {
          defaultValue:
            'Improved Snapshot at load time and retrieve keyframes only when needed\nImproved User entered year if not found in DB\nFixed Issue running commands with symbolic link\nFixed Find executable path and taking snapshot issue'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.2' })}</h4>
      <ul>
        {_('about.news.version_1_5_2.items', {
          defaultValue: 'Fixed Poster not showing on some systems'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.5.0' })}</h4>
      <ul>
        {_('about.news.version_1_5_0.items', {
          defaultValue:
            'Added New processing tab\nAdded Beginning of processing tab\nAdded Display video previews with ruler\nAdded Video preview display\nAdded Split and concat code 1/2\nAdded Remove part button, improve setStartFrom and setEndAt\nAdded New temp directory setting\nFixed Test and fix trim and concat\nFixed Mapping and cleanup temp files\nFixed Auto selection of tracks issue\nFixed Issue with language selector and improve display of snapshots\nFixed Language selector bug'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.10' })}</h4>
      <ul>
        {_('about.news.version_1_4_10.items', {
          defaultValue: 'Fixed Issue with tvShow episode search'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.9' })}</h4>
      <ul>
        {_('about.news.version_1_4_9.items', {
          defaultValue: 'Fixed Intermittent issue detecting ffmpeg path with snaps'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.8' })}</h4>
      <ul>
        {_('about.news.version_1_4_8.items', {
          defaultValue: 'Fixed Workaround ffmpeg MJPEG attachment issue'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.7' })}</h4>
      <ul>
        {_('about.news.version_1_4_7.items', {
          defaultValue: 'Fixed Display issue in matching tab'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.6' })}</h4>
      <ul>
        {_('about.news.version_1_4_6.items', {
          defaultValue:
            'Improved Separate list and video listeners for better update mechanism\nImproved UI responsiveness\nDisabled Controls when encoding\nImproved Movie name matching\nFixed To allow entering year when not in DB'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.5' })}</h4>
      <ul>
        {_('about.news.version_1_4_5.items', {
          defaultValue: 'Fixed Bugs'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.4' })}</h4>
      <ul>
        {_('about.news.version_1_4_4.items', {
          defaultValue: 'Fixed Loading issue with snap version'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.3' })}</h4>
      <ul>
        {_('about.news.version_1_4_3.items', {
          defaultValue:
            'Added Banner and remove update check on linux\nFixed Shm issue with snaps\nFixed Startup issue if program missing'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.1' })}</h4>
      <ul>
        {_('about.news.version_1_4_1.items', {
          defaultValue:
            'Improved Version retriever 1/2\nImproved Display ffmpeg and mkvmerge versions in about dialog\nFixed Div hights'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.4.0' })}</h4>
      <ul>
        {_('about.news.version_1_4_0.items', {
          defaultValue: 'Fixed Clear button wrongly staying disabled'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.3.4' })}</h4>
      <ul>
        {_('about.news.version_1_3_4.items', {
          defaultValue: 'Fixed Disk space issue because of tmp files'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.3.3' })}</h4>
      <ul>
        {_('about.news.version_1_3_3.items', {
          defaultValue: 'Fixed Two pass encoding for x264 and x265\nFixed X265 encoding on windows'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.3.2' })}</h4>
      <ul>
        {_('about.news.version_1_3_2.items', {
          defaultValue: 'Fixed Other type of videos'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.3.0' })}</h4>
      <ul>
        {_('about.news.version_1_3_0.items', {
          defaultValue: 'Improved Tmp files handling and cleanup'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.1.0' })}</h4>
      <ul>
        {_('about.news.version_1_1_0.items', {
          defaultValue: "Added 'other' video type.\nImproved Video codec setting to auto."
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '1.0.0' })}</h4>
      <ul>
        {_('about.news.version_1_0_0.items', {
          defaultValue: 'Added About dialog'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '0.3.0' })}</h4>
      <ul>
        {_('about.news.version_0_3_0.items', {
          defaultValue:
            'Fixed Pause/unpause, cancel and process icon disabled issue\nFixed Mkvmerge language argument inconsistency'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '0.2.1' })}</h4>
      <ul>
        {_('about.news.version_0_2_1.items', {
          defaultValue: 'Fixed Settings update and x265 encoding on linux'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '0.2.0' })}</h4>
      <ul>
        {_('about.news.version_0_2_0.items', {
          defaultValue: 'Added External program path settings\nAdded Settings validation at startup'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
      <h4>{_('about.news.version', { defaultValue: 'Version {version}', version: '0.1.0' })}</h4>
      <ul>
        {_('about.news.version_0_1_0.items', {
          defaultValue:
            'Added Open files with drag drop or button and settings dialog\nAdded Rest of UI\nImproved Preview matching and tracks\nFixed Connect UI to controller with IPC and fix windows packaging'
        })
          .split('\n')
          .map((item, i) => (
            <li key={i}>{item}</li>
          ))}
      </ul>
    </div>
  )
}
