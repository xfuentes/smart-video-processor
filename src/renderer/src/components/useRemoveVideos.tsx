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
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface } from '@fluentui/react-components'
import { Warning24Filled } from '@fluentui/react-icons'
import { IVideo } from '../../../common/@types/Video'
import { _ as t } from '../i18n'

// Removing a video also cancels its running job or takes it out of the queue, which needs a confirmation.
export const useRemoveVideos = (): { requestRemove: (videos: IVideo[]) => void; removeDialog: React.JSX.Element } => {
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

  const removeDialog = (
    <Dialog
      modalType="modal"
      open={pendingIds !== undefined}
      onOpenChange={(_event, data) => !data.open && setPendingIds(undefined)}
    >
      <DialogSurface style={{ padding: '5px', minWidth: '400px' }}>
        <DialogBody>
          <DialogContent>
            <h3
              style={{
                marginBlockStart: 0,
                marginBlockEnd: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Warning24Filled style={{ color: 'red' }} />
              {t('video_list.remove_dialog.title', { defaultValue: 'Remove videos' })}
            </h3>
            <p>
              {t('video_list.remove_dialog.message', {
                defaultValue:
                  'Selected videos: {total}. Queued: {queued}. Being encoded or merged: {processing}. Removing them will cancel their processing. Continue?',
                ...counts
              })}
            </p>
          </DialogContent>
          <DialogActions style={{ paddingTop: '10px' }}>
            <Button size="small" appearance="primary" onClick={confirmRemove}>
              {t('video_list.remove_dialog.confirm', { defaultValue: 'Remove' })}
            </Button>
            <Button size="small" onClick={() => setPendingIds(undefined)}>
              {t('video_list.remove_dialog.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )

  return { requestRemove, removeDialog }
}
