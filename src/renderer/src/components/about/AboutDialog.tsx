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
  DocumentText20Regular,
  News20Regular
} from '@fluentui/react-icons'
import { LicensePanel } from '@renderer/components/about/LicensePanel'
import { LogPanel } from '@renderer/components/about/LogPanel'
import { PoweredByPanel } from '@renderer/components/about/PoweredByPanel'
import { FeaturesPanel } from '@renderer/components/about/FeaturesPanel'
import { NewsPanel } from '@renderer/components/about/NewsPanel'
import { useI18n } from '../../i18n'

const version = window.api.main.version

export const AboutDialog = () => {
  const _ = useI18n()

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
                Smart Video Processor v{version}
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
                <Tab value="logs" icon={<DocumentText20Regular />}>
                  {_('about.tab.logs', { defaultValue: 'Event logs' })}
                </Tab>
              </TabList>
              <div>
                {selectedTab === 'news' && <NewsPanel />}
                {selectedTab === 'features' && <FeaturesPanel />}
                {selectedTab === 'license' && <LicensePanel />}
                {selectedTab === 'logs' && <LogPanel />}
                {selectedTab === 'powered' && <PoweredByPanel />}
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
