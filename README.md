# Smart Video Processor

[![Linux Build](https://img.shields.io/github/actions/workflow/status/xfuentes/smart-video-processor/build-linux.yml?logo=linux&logoColor=white)](https://github.com/xfuentes/smart-video-processor/actions/workflows/build-linux.yml)
[![Windows Build](https://img.shields.io/github/actions/workflow/status/xfuentes/smart-video-processor/build-win32.yml?label=win%20build)](https://github.com/xfuentes/smart-video-processor/actions/workflows/build-win32.yml)
[![SVP Release](https://img.shields.io/github/v/release/xfuentes/smart-video-processor?logo=npm&sort=semver)](https://github.com/xfuentes/smart-video-processor/releases)
![GitHub License](https://img.shields.io/github/license/xfuentes/smart-video-processor)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads-pre/xfuentes/smart-video-processor/latest/total)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/xfuentes/smart-video-processor/total)

This tool automatically identifies your movies and TV shows using popular databases,
then streamlines the entire process: rename files using Plex-friendly conventions,
attach artwork, correct metadata (including track language and type), split or join media files
and encode to H.264 or H.265—all in one place.

## 1) Installation
All dependencies are packaged with it, just install and you will be ready to go.

### a) Linux
[![Get it from the Snap Store](https://snapcraft.io/en/light/install.svg)](https://snapcraft.io/smart-video-processor)

After installation from the Snap Store, you can optionally enable removable media write access with this command :
  ```shell
    sudo snap connect smart-video-processor:removable-media
  ```

Alternatively there is an APPIMAGE file available.

### b) Windows 10 or later

<a href="https://apps.microsoft.com/detail/9pg7l9jr8k6m?referrer=appbadge&mode=direct">
<img src="https://get.microsoft.com/images/en-us%20light.svg" width="200"/>
</a>

Alternatively you can install the Smart.Video.Processor-*.Setup.exe it will install the required dependencies and add a desktop shortcut.

## 2) Set your preferences

On the main toolbar click the settings button and the settings Dialog will open.
Set your preferences and click the Apply button.

![Settings-page](docs/img/01-Settings.png)

## 3) Opening a video file

You can either open a file using the open button or by dragging and dropping the files you want to open directly in the
video list.
The program will then load the file and extract all the needed information.
In the background the great mkvmerge (https://www.matroska.org/downloads/mkvtoolnix.html) tool is run to retrieve
tracks and attachments. If some needed metadata are missing the file will be analysed further.

![Video List](./docs/img/02-VideoList.png)

## 4) Matching

Using the filename of the video to process, guesses will be made to determine if the video is a movie or a TV Series
episode.

## 5) The video is a movie

From the filename some information can be extracted:
The title, the year, languages and version information.
You can complete or update required information about the movie until everything is correct and click the search button.
A request is made on TMDB (https://www.themoviedb.org/) to retrieve movie's details.
If the matched movie is not correct you have the possibility to select another match from the list.
The movie's poster and description are displayed you can now proceed to the next step.

![Matching a Movie](docs/img/03-Movie.png)

## 6) The video is a TV Series episode.

From the filename some information can be extracted:
The title, the year, the season number, episode number, languages and version information.
You can complete or update required information about the episode until everything is correct and click the search
button.
A request is made on TheTVDB (https://thetvdb.com/) to retrieve series and episode details.
If the matched series and episode is not correct you have the possibility to select another match from the list.
The series and episode images and description are displayed you can now proceed to the next step.

![Matching a Series Episode](docs/img/04-TVShow.png)

## 7) Select tracks

Examine the track list and unselect the ones you want to remove.

![Track List](docs/img/05-Tracks.png)

## 8) Provide hints

If some information from the original file is missing or is incomplete hints will be requested.

![Providing Hints](docs/img/06-Hints.png)

## 9) Add/Review matroska properties changes

Check the changes that will be done. You can also add some custom changes.

![Review Processing](docs/img/07-Properties.png)

## 10) Trim/Concat video in Processing tab (optional)

This optional step can be used to trim start or end of a video file.
For videos in multiple parts or multiple DVD you can combine them in one video file.

![Processing](docs/img/08-Processing.png)

## 11) Choose tracks to encode and start processing

Select the video or audio tracks to encode. Depending on settings the program will auto-select the tracks
that needs encoding. Under the information icon you will see the selected codec and the expected size reduction.

![Encoding](docs/img/09-Encoding.png)

Clicking the process button will start the processing. The file will be output on ./Reworked directory relative to
source file.
This can be changed in the settings.
For encoding audio or video files, ffmpeg (https://ffmpeg.org/) is launched in background.
For processing and adding poster to the mkv file mkvmerge (https://www.matroska.org/downloads/mkvtoolnix.html) is run in
background.

## 12) Wait for the processing to complete

You can see progression info and estimated time left.

![Waiting](docs/img/10-Waiting.png)
