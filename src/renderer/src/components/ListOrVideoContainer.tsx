import { VideoPlayer } from '@renderer/components/VideoPlayer'
import { MainToolbar } from '@renderer/components/MainToolbar'
import { Divider } from '@fluentui/react-components'
import { VideoList } from '@renderer/components/VideoList'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { IVideo } from '../../../common/@types/Video'

type props = {
  videos: IVideo[]
  selectedVideos: IVideo[]
  onSelectionChange: (videos: IVideo[]) => void
  onImportVideos: (files: File[]) => void
}

export const ListOrVideoContainer = ({ videos, selectedVideos, onSelectionChange, onImportVideos }: props) => {
  const { videoPlayerOpened } = useVideoPlayer()
  const previewShown = selectedVideos.length > 0 && selectedVideos.find((sv) => sv.loading) === undefined
  return (
    <>
      {videoPlayerOpened ? (
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <VideoPlayer />
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: 'var(--colorNeutralBackground1)' }}>
            <MainToolbar
              onOpen={(directories) => window.api.video.openFileExplorer(directories)}
              videos={videos}
              selectedVideos={selectedVideos}
            />
          </div>
          <Divider />
          <div
            className="stack-item-grow"
            style={previewShown ? { borderBottom: '1px solid var(--colorNeutralStroke2)' } : undefined}
          >
            <div style={{ height: '100%' }}>
              <VideoList videos={videos} onSelectionChange={onSelectionChange} onImportVideos={onImportVideos} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
