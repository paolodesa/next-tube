import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  MediaMuteButton,
  MediaOutlet,
  MediaPlayer,
  MediaSliderValue,
  MediaTime,
  MediaTimeSlider,
  MediaToggleButton,
  MediaVolumeSlider,
} from "@vidstack/react";

dayjs.extend(relativeTime);

import { useMediaRemote, useMediaStore } from "@vidstack/react";
import { type PropsWithChildren, useState, useRef, useEffect } from "react";
import {
  type MediaRemoteControl,
  type MediaToggleButtonElement,
  type VideoQuality,
  type MediaProviderChangeEvent,
  isHLSProvider,
} from "vidstack";
import { SettingsIcon } from "~/icons/player/Settings";
import useOnClickOutside from "~/utils/outsideClickHook";
import { PlayIcon } from "~/icons/player/Play";
import { PauseIcon } from "~/icons/player/Pause";
import { ReplayIcon } from "~/icons/player/Replay";
import { FullscreenIcon } from "~/icons/player/Fullscreen";
import { ExitFullscreenIcon } from "~/icons/player/ExitFullscreen";
import { MuteIcon } from "~/icons/player/Mute";
import { VolumeLowIcon } from "~/icons/player/VolumeLow";
import { VolumeHighIcon } from "~/icons/player/VolumeHigh";
import { TickIcon } from "~/icons/Tick";
import { useAtom } from "jotai";
import { TheaterIcon } from "~/icons/player/Theater";
import { ExitTheaterIcon } from "~/icons/player/ExitTheater";
import { theaterModeAtom } from "~/utils/atoms";
import Link from "next/link";
import type { VideoThumbnail } from "@prisma/client";

const MenuItems = (props: { smallPlayer: boolean }) => {
  const { qualities, autoQuality, quality: activeQuality } = useMediaStore();
  const remote = useMediaRemote();
  const smallPlayer = props.smallPlayer;
  const [activeQualityLevel, setActiveQualityLevel] = useState<number>();

  function onAutoSelect() {
    remote.changeQuality(-1);
  }

  useEffect(() => {
    switch (activeQuality?.width) {
      case 3840:
        setActiveQualityLevel(2160);
        break;
      case 1920:
        setActiveQualityLevel(1080);
        break;
      case 1280:
        setActiveQualityLevel(720);
        break;
      case 640:
        setActiveQualityLevel(360);
        break;
      default:
        setActiveQualityLevel(activeQuality?.height);
    }
  }, [activeQuality]);

  return (
    <div
      className={`${
        smallPlayer
          ? "fullscreen:max-h-32 not-fullscreen:-right-[36px] not-fullscreen:max-h-[114px] fullscreen:sm:max-h-[calc(var(--max-player-height)*0.60)]"
          : "max-h-32 not-fullscreen:-right-[92px] sm:max-h-[calc(var(--max-player-height)*0.60)]"
      } absolute -top-4 z-30 flex w-56 -translate-y-full flex-col overflow-hidden overflow-y-scroll rounded-xl bg-stone-800/90 pb-2 text-xs text-[#eee] fullscreen:-right-[48px]`}
    >
      <span className="px-6 py-4">Quality</span>
      <div className="mb-2 border-t-[1px] border-stone-500/50"></div>
      {qualities
        .map((quality, index) => {
          const menuItemProps = {
            quality,
            index,
            remote,
            activeQuality,
            autoQuality,
          };
          return <MenuItem key={index} {...menuItemProps} />;
        })
        .reverse()}
      <button
        onPointerDown={onAutoSelect}
        className="flex items-center gap-2 px-3 py-3 hover:bg-stone-500/50"
      >
        <div className="w-[18px]">
          {autoQuality && <TickIcon className="w-[18px]" white />}
        </div>
        <span>
          Auto {autoQuality && activeQualityLevel && `(${activeQualityLevel}p`}
          {autoQuality && activeQualityLevel === 1080 && (
            <sup>HD</sup>
          )}
          {autoQuality && activeQualityLevel === 2160 && (
            <sup>4K</sup>
          )}
          {activeQuality && autoQuality && ")"}
        </span>
      </button>
    </div>
  );
};

const MenuItem = (props: {
  quality: VideoQuality;
  index: number;
  remote: MediaRemoteControl;
  activeQuality: VideoQuality | null;
  autoQuality: boolean;
}) => {
  function onSelect() {
    props.remote.changeQuality(props.index);
  }
  let qualityLevel: string;

  switch (props.quality.width) {
    case 3840:
      qualityLevel = "2160";
      break;
    case 1920:
      qualityLevel = "1080";
      break;
    case 1280:
      qualityLevel = "720";
      break;
    case 640:
      qualityLevel = "360";
      break;
    default:
      qualityLevel = props.quality.height.toString();
  }

  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-2 px-3 py-3 hover:bg-stone-500/50 "
    >
      <div className="w-[18px]">
        {!props.autoQuality && props.quality === props.activeQuality && (
          <TickIcon className="w-[18px]" white />
        )}
      </div>
      <span>
        {`${qualityLevel}p`}
        {props.quality.width === 1920 && <sup>HD</sup>}
        {props.quality.width === 3840 && <sup>4K</sup>}
      </span>
    </button>
  );
};

function SliderTrack() {
  return (
    <div className="absolute bottom-0 z-0 h-[var(--track-height)] w-full bg-white/20 outline-none group-data-[interactive]:h-[var(--interactive-track-height)] group-data-[focus]:ring-4 group-data-[focus]:ring-blue-400"></div>
  );
}

function SliderTrackFill() {
  return (
    <div
      className="absolute bottom-0 left-0 z-20 h-[var(--track-height)] w-full scale-x-[var(--slider-fill-rate)] bg-[#f00] group-data-[interactive]:h-[var(--interactive-track-height)]"
      style={{ transformOrigin: "left center" }}
    />
  );
}

function SliderTrackProgress() {
  return (
    <div
      className="absolute bottom-0 left-0 z-10 h-[var(--track-height)] w-full scale-x-[calc(var(--media-buffered)/var(--media-duration))] bg-white/40 group-data-[interactive]:h-[var(--interactive-track-height)]"
      style={{ transformOrigin: "left center" }}
    ></div>
  );
}

function SliderThumb() {
  return (
    <div className="absolute left-[var(--slider-fill-percent)] top-0 z-20 h-[var(--thumb-size)] w-[var(--thumb-size)] -translate-x-1/2 translate-y-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]">
      <div className="h-full w-full rounded-full bg-[#f00] opacity-0 transition-opacity duration-150 ease-in group-data-[interactive]:opacity-100"></div>
    </div>
  );
}

function SliderPreview(props: PropsWithChildren) {
  // The `--preview-top` and `--preview-left` CSS vars are applied by the slider to the `preview`
  // slot to help with positioning. See the "Slider > CSS Variables" section for more information.
  return (
    <>
      <div
        className="absolute bottom-0 left-0 z-10 h-[var(--track-height)] bg-white/40 group-data-[interactive]:h-[var(--interactive-track-height)] group-data-[interactive]:w-[var(--slider-pointer-percent)]"
        style={{ transformOrigin: "left center" }}
      ></div>
      <div
        className="absolute left-[var(--preview-left)] top-[var(--preview-top)] -translate-x-1/2 text-xs text-[#eee] opacity-0 transition-opacity duration-200 ease-out group-data-[interactive]:opacity-100 group-data-[interactive]:ease-in"
        slot="preview"
        style={{ textShadow: "0 0 4px rgba(0,0,0,.75)" }}
      >
        {props.children}
      </div>
    </>
  );
}

function VolumeSliderTrack() {
  return (
    <div className="absolute top-1/2 z-0 h-[var(--track-height)] w-full -translate-y-1/2 bg-white/20 outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-blue-400"></div>
  );
}

function VolumeSliderTrackFill() {
  return (
    <div
      className="absolute left-0 top-1/2 z-20 h-[var(--track-height)] w-full -translate-y-1/2 scale-x-[var(--slider-fill-rate)] bg-white"
      style={{ transformOrigin: "left center" }}
    />
  );
}

function VolumeSliderThumb() {
  return (
    <div className="absolute left-[var(--slider-fill-percent)] top-1/2 z-20 h-[var(--vol-thumb-size)] w-[var(--vol-thumb-size)] -translate-x-1/2 -translate-y-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]">
      <div className="h-full w-full rounded-full bg-white"></div>
    </div>
  );
}

const VolumeControls = (props: { smallPlayer: boolean }) => {
  const smallPlayer = props.smallPlayer;
  return (
    <div
      className={`${
        smallPlayer
          ? "fullscreen:w-12 fullscreen:hover:w-32 not-fullscreen:w-9 not-fullscreen:hover:w-28"
          : "w-12 hover:w-32"
      } flex items-center justify-start overflow-hidden duration-300`}
    >
      <MediaMuteButton
        className={`${
          smallPlayer
            ? "fullscreen:h-12 fullscreen:w-12 not-fullscreen:h-9 not-fullscreen:w-9"
            : "h-12 w-12"
        } group relative mr-0.5 flex items-center justify-center rounded-sm p-1.5 text-white opacity-90 outline-none hover:opacity-100 data-[focus]:ring-4 data-[focus]:ring-blue-400`}
        title="Mute (m)"
        aria-keyshortcuts="m"
      >
        {/* icons */}
        <MuteIcon
          className={`${
            smallPlayer ? "fullscreen:w-9 not-fullscreen:w-6" : "w-9"
          } hidden group-data-[volume=muted]:block`}
        />
        <VolumeLowIcon
          className={`${
            smallPlayer ? "fullscreen:w-9 not-fullscreen:w-6" : "w-9"
          } hidden group-data-[volume=low]:block`}
        />
        <VolumeHighIcon
          className={`${
            smallPlayer ? "fullscreen:w-9 not-fullscreen:w-6" : "w-9"
          } hidden group-data-[volume=high]:block`}
        />
      </MediaMuteButton>
      <MediaVolumeSlider
        className="group relative mx-[calc(var(--vol-thumb-size)/2)] h-full w-[52px] cursor-pointer"
        style={{ "--vol-thumb-size": "12px", "--track-height": "3px" }}
      >
        <VolumeSliderTrack />
        <VolumeSliderTrackFill />
        <VolumeSliderThumb />
      </MediaVolumeSlider>
    </div>
  );
};

const MediaControls = (props: {
  smallPlayer: boolean;
  videoTitle: string;
  videoId: string;
}) => {
  const [qualityMenuVisible, setQualityMenuVisible] = useState(false);
  const qualityMenuRef = useRef<MediaToggleButtonElement>(null);
  const [theater, setTheater] = useAtom(theaterModeAtom);
  const { quality: activeQuality } = useMediaStore();
  const smallPlayer = props.smallPlayer;

  useOnClickOutside(qualityMenuRef, () => setQualityMenuVisible(false));
  const remote = useMediaRemote();

  function onSelect() {
    setQualityMenuVisible((visible) => !visible);
  }

  const toggleTheater = () => {
    setTheater(!theater);
  };

  const toggleFullscreen = () => {
    remote.toggleFullscreen();
  };

  const togglePlay = () => {
    remote.togglePaused();
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-10 flex h-full flex-col justify-end opacity-0 transition-opacity duration-200 ease-linear user-idle:cursor-none can-control:opacity-100"
      aria-label="Media Controls"
    >
      <div
        className={`${
          smallPlayer
            ? "not-fullscreen:!hidden can-control:block"
            : "not-fullscreen:!hidden can-control:block"
        } absolute top-0 hidden h-[146px] w-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAEmCAYAAACjy/qzAAAAhklEQVQ4y52RUQ6AMAxCKd7/JJ7R6aeJAdr507TjQZqOAE4CWARwx7JE944rch/k6qOWS7bq5bh72zGF8+LTa6goJeRPgXDYNxWFfkS0QXCInLIN1GxTXA0dtS0otWJnuXJR1Y9WYP9GF1UCYRQYHRSlXMARbVO4th3sd7Y3OP5dY3Bn+SkPsGJ1+HGGVtcAAAAASUVORK5CYII=')] bg-top`}
      ></div>
      <div
        className={`${
          smallPlayer ? "fullscreen:!hidden can-control:block" : ""
        } absolute top-0 hidden h-[98px] w-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==')] bg-top`}
      ></div>
      <div
        className={`${
          smallPlayer
            ? "not-fullscreen:!hidden can-control:block"
            : "can-control:block"
        } absolute hidden h-44 w-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAACzCAYAAABIF3b3AAAAAXNSR0IArs4c6QAAAQhJREFUOE9lyNdHBQAAhfHb3nvvuu2997jNe29TJJEkkkgSSSSJJJFEEkkiSfRH5jsP56Xz8PM5gcC/xfCIWIgz8ZRIMIlUkkmmRIpJpdJMOiUyTCaVZbIpkWNyqTyTT4kCU0gVmWJKlJhSqsyUU6LCVFJVppoSNSZIiVqoM/WUaDCNVJNppkSLaaXaTDslOkwn1WW6KdFjeqk+00+JATNIDZlhSoyYUWrMjFNiwoSoSTNFiWkzQ82aOUqETYSKmnlKLJhFasksUyuwCmuwDhuwCVuwDTuwC3uwDwdwCEdwDCdwCmdwDhdwCVdwDTdwC3dwDw/wCE/wDC/wCm/wDh/wCV/wDT/w+web0CjNtRN1AgAAAABJRU5ErkJggg==')]`}
      ></div>
      <div
        className={`${
          smallPlayer ? "fullscreen:!hidden can-control:block" : ""
        } absolute hidden h-[97px] w-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAABhCAYAAAAX4cvTAAAAAXNSR0IArs4c6QAAAL9JREFUKFNNx9FGAwAAQNGVUlOaUtY0pWxZmmapKU1ptpQlkURmIhNJxiSSiZnEJJJIJjIZfWTOW/fhcAOB//WYXvShHwMYRBBDGMYIQhjFGMYxgTAmEcEUopjGDGYxhxjimEcCC1hEEktIIY1lrGAVGaxhHRvIYhNb2EYOeRSwg13soYh9HOAQRzjGCU5RQhlnOEcFF7jEFa5RRQ03uMUd7lHHAxpo4hFPaOEZL3jFG97xgU+08YVvdPCDLn7/AHddHHnn9FB8AAAAAElFTkSuQmCC')] pt-[49px]`}
      ></div>
      <MediaControlGroup>
        {smallPlayer && (
          <div className="fullscreeen:w-full hidden overflow-hidden text-ellipsis fullscreen:px-0.5 fullscreen:pt-[18px] not-fullscreen:w-[400px] not-fullscreen:pt-3 can-control:block">
            <Link
              href={`/watch/${props.videoId}`}
              className="whitespace-nowrap text-lg text-white fullscreen:text-2xl"
            >
              {props.videoTitle}
            </Link>
          </div>
        )}
        {!smallPlayer && (
          <div className="hidden w-full overflow-hidden text-ellipsis px-0.5 pt-[18px] not-fullscreen:!hidden can-control:block">
            <span className="whitespace-nowrap text-2xl text-white">
              {props.videoTitle}
            </span>
          </div>
        )}
      </MediaControlGroup>
      <div
        className="z-20 h-full w-full"
        onClick={() => remote.togglePaused()}
      ></div>
      <MediaTimeSlider
        className="group relative mx-auto cursor-pointer pt-4"
        style={{
          "--interactive-track-height": "5px",
          "--track-height": "3px",
          "--thumb-size": "13px",
          width: "calc(100% - 24px)",
        }}
      >
        <SliderTrack />
        <SliderTrackFill />
        <SliderTrackProgress />
        <SliderThumb />
        <SliderPreview>
          <MediaSliderValue type="pointer" format="time" />
        </SliderPreview>
      </MediaTimeSlider>
      <MediaControlGroup className={`${smallPlayer ? "" : ""}`}>
        <MediaToggleButton
          className={`flex ${
            smallPlayer ? "fullscreen:w-11 not-fullscreen:w-8" : "w-11"
          } items-center justify-center rounded-sm text-white opacity-90 outline-none hover:opacity-100 data-[focus]:ring-4 data-[focus]:ring-blue-400`}
          title="Play (k)"
          aria-keyshortcuts="k Space"
          onClick={togglePlay}
        >
          <PlayIcon className="hidden ended:!hidden paused:block" />
          <PauseIcon className="hidden not-paused:block" />
          <ReplayIcon className="hidden ended:block" />
        </MediaToggleButton>
        <VolumeControls smallPlayer={smallPlayer} />
        <div className="ml-0.5 flex h-full items-center gap-1 text-xs font-light text-[#ddd]">
          <MediaTime type="current" />
          {"/"}
          <MediaTime type="duration" />
        </div>
        <div className="ml-auto flex">
          <MediaToggleButton
            className={`relative hover:opacity-100 ${
              qualityMenuVisible ? "opacity-100" : "opacity-90"
            }`}
            onClick={onSelect}
            ref={qualityMenuRef}
          >
            <SettingsIcon
              className={`w-11 duration-200 ${
                qualityMenuVisible ? "rotate-[30deg]" : ""
              } ${smallPlayer ? "fullscreen:w-11 not-fullscreen:w-8" : "w-11"}`}
            />
            {activeQuality && activeQuality.width === 1920 && (
              <span
                className={`${
                  smallPlayer
                    ? "fullscreen:px-[2px] not-fullscreen:px-[1px]"
                    : "px-[2px]"
                } absolute right-0.5 top-2 rounded-sm bg-[#f00] text-[8px] font-medium text-white`}
              >
                HD
              </span>
            )}
            {activeQuality && activeQuality.width === 3840 && (
              <span
                className={`${
                  smallPlayer
                    ? "fullscreen:px-[2px] not-fullscreen:px-[1px]"
                    : "px-[2px]"
                } absolute right-0.5 top-2 rounded-sm bg-[#f00] text-[8px] font-medium text-white`}
              >
                4K
              </span>
            )}
            {qualityMenuVisible && <MenuItems smallPlayer={smallPlayer} />}
          </MediaToggleButton>
          {!smallPlayer && (
            <MediaToggleButton
              onClick={toggleTheater}
              aria-keyshortcuts="t"
              className="flex w-11 items-center justify-center rounded-sm opacity-90 hover:opacity-100 fullscreen:hidden"
            >
              {!theater && <TheaterIcon />}
              {theater && <ExitTheaterIcon />}
            </MediaToggleButton>
          )}
          <MediaToggleButton
            className={`flex ${
              smallPlayer ? "fullscreen:w-11 not-fullscreen:w-8" : "w-11"
            } items-center justify-center rounded-sm text-white opacity-90 outline-none hover:opacity-100 data-[focus]:ring-4 data-[focus]:ring-blue-400`}
            aria-label="Fullscreen (f)"
            aria-keyshortcuts="f"
            onClick={toggleFullscreen}
          >
            <FullscreenIcon className="hidden not-fullscreen:block" />
            <ExitFullscreenIcon className="hidden fullscreen:block" />
          </MediaToggleButton>
        </div>
      </MediaControlGroup>
    </div>
  );
};

function MediaControlGroup(props: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={`${
        props.className ?? ""
      } pointer-events-none relative flex h-12 w-full px-4 can-control:pointer-events-auto`}
    >
      {props.children}
    </div>
  );
}

export const VideoPlayer = (props: {
  videoId: string;
  videoTitle: string;
  channelId: string;
  smallPlayer?: boolean;
  thumbnail?: VideoThumbnail;
}) => {
  const [theater] = useAtom(theaterModeAtom);
  const [thumbNumber, setThumbNumber] = useState<number>();
  const smallPlayer = props.smallPlayer ?? false;

  useEffect(() => {
    switch (props.thumbnail) {
      case "A":
        setThumbNumber(1);
        break;
      case "B":
        setThumbNumber(2);
        break;
      case "C":
        setThumbNumber(3);
        break;
      case "CUSTOM":
        setThumbNumber(0);
        break;
    }
  }, [props.thumbnail]);

  function onProviderChange(event: MediaProviderChangeEvent) {
    const provider = event.detail;
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
    }
  }

  return (
    <MediaPlayer
      className={`group pointer-events-none relative flex max-h-[var(--max-player-height)] justify-center bg-black outline-none ${
        theater
          ? "col-span-2 w-full"
          : "col-span-1 w-[min(100%,calc(var(--max-player-height)*16/9))]"
      }`}
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${props.channelId}/${props.videoId}/master.m3u8`}
      poster={
        thumbNumber !== undefined
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${props.channelId}/${props.videoId}/thumb-${thumbNumber}.jpeg`
          : ""
      }
      tabIndex={-1}
      onProviderChange={onProviderChange}
    >
      <MediaOutlet className="grow fullscreen:self-center not-started:aspect-video not-started:object-cover" />
      <MediaControls
        videoId={props.videoId}
        videoTitle={props.videoTitle}
        smallPlayer={smallPlayer}
      />
    </MediaPlayer>
  );
};
