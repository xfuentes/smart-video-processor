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
  return (
    <>
      {videoPlayerOpened ? (
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <VideoPlayer />
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#f7f8fa' }}>
            <MainToolbar
              onOpen={() => window.api.video.openFileExplorer()}
              videos={videos}
              selectedVideos={selectedVideos}
            />
          </div>
          <Divider />
          <div className="stack-item-grow">
            <div style={{ height: '100%' }}>
              <VideoList videos={videos} onSelectionChange={onSelectionChange} onImportVideos={onImportVideos} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
