import { type CSSProperties, useEffect, useState } from "react";
import { VideoCard } from "./VideoCard";
import { api } from "~/utils/api";
import Link from "next/link";
import { ArrowRightIcon } from "~/icons/ArrowRight";
import { useAtom } from "jotai";
import { channelCarouselCards } from "~/utils/atoms";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { VideoPlayer } from "./VideoPlayer";

dayjs.extend(relativeTime);

export const ChannelFeatured = (props: { channelHandle: string }) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  });
  const { data: videosData, isLoading: videosLoading } =
    api.video.getByChannelHandle.useQuery({
      channelHandle: props.channelHandle,
      orderBy: "createdAt",
    });
  const [carouselCards] = useAtom(channelCarouselCards);
  const [carouselPos, setCarouselPos] = useState(0);
  const [carouselCardsFwd, setCarouselCardsFwd] = useState(0);

  useEffect(() => {
    if (videosData) {
      const featVidsCount = videosData.length * 9;
      setCarouselCardsFwd(featVidsCount - (carouselPos + carouselCards));
    }
  }, [videosData, carouselPos, carouselCards]);

  const moveCarouselBwd = () => {
    const prevCardsCount = Math.min(carouselPos, carouselCards);
    const carouselEl = document.querySelector<HTMLDivElement>(
      "#featured-videos-carousel"
    );
    if (carouselEl) {
      carouselEl.style.setProperty(
        "transform",
        `translate(-${carouselPos * 214 - prevCardsCount * 214}px, 0)`
      );
      setCarouselPos((pos) => pos - prevCardsCount);
    }
  };

  const moveCarouselFwd = () => {
    const followingCardsCount = Math.min(carouselCardsFwd, carouselCards);
    const carouselEl = document.querySelector<HTMLDivElement>(
      "#featured-videos-carousel"
    );
    if (carouselEl) {
      carouselEl.style.setProperty(
        "transform",
        `translate(-${carouselPos * 214 + followingCardsCount * 214}px, 0)`
      );
      setCarouselPos((pos) => pos + followingCardsCount);
    }
  };

  if (videosLoading) return <div>Loading...</div>;

  if (!videosData) return <div>Something went wrong</div>;

  return (
    <>
      {videosData.length !== 0 && (
        <div className="mx-auto max-w-[var(--max-content-width)] px-[var(--content-padding-x)]">
          {videosData[0] && (
            <div className="h-min-[286px] flex w-full flex-wrap gap-6 border-b-[1px] border-stone-200 py-6 dark:border-stone-700">
              <div className="h-full w-[424px] overflow-hidden rounded-2xl">
                <VideoPlayer
                  smallPlayer
                  videoId={videosData[0].id}
                  videoTitle={videosData[0].title}
                  channelId={videosData[0].channelId}
                  thumbnail={videosData[0].thumbnail}
                />
              </div>
              <div className="flex w-[min(400px,100%)] flex-col whitespace-nowrap min-[682px]:w-[194px] min-[957px]:w-[400px]">
                <Link
                  href={`/watch/${videosData[0].id}`}
                  className="mb-4 max-w-full overflow-hidden text-ellipsis text-sm font-medium"
                >
                  {videosData[0].title}
                </Link>
                <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{`${formatter.format(
                  videosData[0].views
                )} views · ${dayjs(videosData[0].createdAt).fromNow()}`}</span>
              </div>
            </div>
          )}
          <div className="mt-6">
            <Link
              href={`/@${props.channelHandle}/videos`}
              className="font-medium"
            >
              Videos
            </Link>
          </div>
          <div className="relative w-full">
            <div className="w-full overflow-hidden py-6">
              <div
                id="featured-videos-carousel"
                style={
                  {
                    "--max-card-width": "214px",
                    "--min-card-width": "214px",
                  } as CSSProperties
                }
                className="grid w-full grid-flow-col grid-cols-[repeat(auto-fill,214px)] transition-transform"
              >
                {videosData.map((video, index) => (
                  <VideoCard
                    hideChannel
                    isCarousel
                    {...video}
                    key={`video-card-${index}`}
                  />
                ))}
              </div>
            </div>
            {carouselPos !== 0 && (
              <button
                onClick={moveCarouselBwd}
                style={{
                  boxShadow:
                    "0 4px 4px rgba(0,0,0,0.3), 0 0 4px rgba(0,0,0,0.2)",
                }}
                className="group absolute left-0 top-[83px] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:bg-[#212121]"
              >
                <div className="absolute h-full w-full rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/20"></div>
                <ArrowRightIcon className="rotate-180" />
              </button>
            )}
            {carouselPos + carouselCards !== videosData.length &&
              videosData.length > carouselCards && (
                <button
                  onClick={moveCarouselFwd}
                  style={{
                    boxShadow:
                      "0 4px 4px rgba(0,0,0,0.3), 0 0 4px rgba(0,0,0,0.2)",
                  }}
                  className="group absolute right-1 top-[83px] flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white dark:bg-[#212121]"
                >
                  <div className="absolute h-full w-full rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/20"></div>
                  <ArrowRightIcon />
                </button>
              )}
          </div>
        </div>
      )}
      {videosData.length === 0 && (
        <div className="mx-auto flex justify-center mt-4 max-w-[var(--max-content-width)] px-[var(--content-padding-x)]">
          <span className="mx-auto text-sm">
            {"This channel doesn't have any content"}
          </span>
        </div>
      )}
    </>
  );
};
