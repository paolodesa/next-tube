import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { durationFormatter } from "~/utils/durationFormatter";

dayjs.extend(relativeTime);

type VideoDetails = RouterOutputs["video"]["getAll"][number];
export const VideoCard = (
  props: VideoDetails & { hideChannel?: boolean; isCarousel?: boolean }
) => {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  const router = useRouter();
  const [thumbNumber, setThumbNumber] = useState(1);

  const {
    id,
    title,
    duration,
    channelName,
    channelHandle,
    views,
    createdAt,
    thumbnail,
    channelHasLogo,
    channelId,
  } = props;

  const hideChannel = props.hideChannel ?? false;
  const isCarousel = props.isCarousel ?? false;

  useEffect(() => {
    switch (thumbnail) {
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
  }, [thumbnail]);

  const goToVideo = async () => {
    await router.push(`/watch/${id}`);
  };

  return (
    <div
      onClick={() => void goToVideo()}
      className={`${
        isCarousel ? "pr-1" : ""
      } w-[var(--max-card-width)] max-w-[100%] cursor-pointer`}
    >
      <Link href={`/watch/${id}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            fill={true}
            className="object-cover"
            alt="thumbnail"
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${channelId}/${id}/thumb-${thumbNumber}.jpeg`}
          />
          <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black bg-opacity-80 p-0.5 text-xs font-medium text-white">
            <span>{durationFormatter(duration)}</span>
          </div>
        </div>
      </Link>
      <div
        className={`${
          !hideChannel ? "grid" : "block"
        } mt-3 w-full grid-cols-[2.25rem_1fr] gap-3`}
      >
        {!hideChannel && (
          <Link
            onClick={(e) => e.stopPropagation()}
            href={`/@${channelHandle}`}
            className="relative h-9 w-9 overflow-hidden rounded-full bg-red-600"
          >
            {channelHasLogo && (
              <Image
                fill
                alt="channel's logo"
                src={`${
                  process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
                }/storage/v1/object/public/pictures/${channelId}/logo`}
              />
            )}
          </Link>
        )}
        <div className={`${hideChannel ? "text-sm" : ""} flex flex-col pr-6`}>
          <Link href={`/watch/${id}`} className="mb-1 line-clamp-2 font-medium">
            {title}
          </Link>
          <div className="flex flex-col text-sm text-text-secondary dark:text-text-secondary-dark">
            {!hideChannel && (
              <Link
                onClick={(e) => e.stopPropagation()}
                className="line-clamp-1 w-full hover:text-[#0f0f0f] dark:hover:text-[#f1f1f1]"
                href={`/@${channelHandle}`}
              >
                {channelName}
              </Link>
            )}
            <span
              className={`${hideChannel ? "text-xs" : ""}`}
            >{`${formatter.format(views)} views · ${dayjs(
              createdAt
            ).fromNow()}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
