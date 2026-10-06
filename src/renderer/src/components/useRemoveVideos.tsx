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

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  tokens
} from '@fluentui/react-components'
import { Delete20Regular, Warning24Filled } from '@fluentui/react-icons'
import { IVideo } from '../../../common/@types/Video'
import { _ as t } from '../i18n'

// Removing a video also cancels its running job or takes it out of the queue, which needs a confirmation.
export const useRemoveVideos = (): {
  requestRemove: (videos: IVideo[]) => void
  removeDialog: React.JSX.Element
} => {
  const [pendingIds, setPendingIds] = useState<string[]>()
  const [counts, setCounts] = useState({ total: 0, queued: 0, processing: 0 })

  const requestRemove = (videos: IVideo[]) => {
    if (videos.length === 0) {
      return
    }
    const ids = videos.map((video) => video.uuid)
    const processing = videos.filter((video) => video.processing).length
    const queued = videos.filter((video) => video.queued && !video.processing).length
    if (processing + queued > 0) {
      setCounts({ total: videos.length, queued, processing })
      setPendingIds(ids)
    } else {
      void window.api.video.remove(ids)
    }
  }

  const confirmRemove = () => {
    if (pendingIds) {
      void window.api.video.remove(pendingIds)
    }
    setPendingIds(undefined)
  }

  const statTile = (value: number, label: string, color: string) => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '12px 8px',
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground3,
        opacity: value === 0 ? 0.5 : 1
      }}
    >
      <span style={{ fontSize: tokens.fontSizeHero700, fontWeight: tokens.fontWeightSemibold, color, lineHeight: 1.1 }}>
        {value}
      </span>
      <span style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2, textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )

  const removeDialog = (
    <Dialog
      modalType="modal"
      open={pendingIds !== undefined}
      onOpenChange={(_event, data) => !data.open && setPendingIds(undefined)}
    >
      <DialogSurface style={{ maxWidth: '460px', padding: '24px' }}>
        <DialogBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DialogTitle>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: tokens.colorStatusDangerBackground1,
                  color: tokens.colorStatusDangerForeground1,
                  flexShrink: 0
                }}
              >
                <Warning24Filled />
              </span>
              {t('video_list.remove_dialog.title', { defaultValue: 'Remove videos' })}
            </span>
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {statTile(
                counts.total,
                t('video_list.remove_dialog.selected', { defaultValue: 'Selected' }),
                tokens.colorNeutralForeground1
              )}
              {statTile(
                counts.queued,
                t('video_list.remove_dialog.queued', { defaultValue: 'Queued' }),
                tokens.colorPaletteBlueForeground2
              )}
              {statTile(
                counts.processing,
                t('video_list.remove_dialog.processing', { defaultValue: 'Encoding or merging' }),
                tokens.colorPaletteDarkOrangeForeground1
              )}
            </div>
            <span style={{ color: tokens.colorNeutralForeground2 }}>
              {t('video_list.remove_dialog.warning', {
                defaultValue: 'Removing these videos will cancel their processing. This cannot be undone.'
              })}
            </span>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setPendingIds(undefined)}>
              {t('video_list.remove_dialog.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              appearance="primary"
              icon={<Delete20Regular />}
              style={{ backgroundColor: tokens.colorStatusDangerBackground3 }}
              onClick={confirmRemove}
            >
              {t('video_list.remove_dialog.confirm', { defaultValue: 'Remove' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )

  return { requestRemove, removeDialog }
}
