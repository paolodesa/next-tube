import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { durationFormatter } from "~/utils/durationFormatter";

dayjs.extend(relativeTime);

type VideoDetails = RouterOutputs["video"]["getAll"][number];
export const VideoCardSm = (props: VideoDetails) => {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  const [thumbNumber, setThumbNumber] = useState(1);

  const { id, title, duration, channelName, views, createdAt, thumbnail, channelId } =
    props;

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

  return (
    <Link
      href={`/watch/${id}`}
      className="mb-2 grid w-full grid-cols-[10.5rem_1fr] gap-2"
    >
      <div className="relative h-[calc(10.5rem*9/16)] overflow-hidden rounded-xl">
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
      <div className="flex w-full gap-3">
        <div className="flex flex-col pr-6">
          <span className="mb-1 line-clamp-2 text-sm font-medium">{title}</span>
          <div className="flex flex-col gap-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">
            <span>{channelName}</span>
            <span>{`${formatter.format(views)} views · ${dayjs(
              createdAt
            ).fromNow()}`}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
