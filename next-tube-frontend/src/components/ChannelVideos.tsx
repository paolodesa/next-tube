import { type CSSProperties, useState } from "react";
import { VideoCard } from "./VideoCard";
import { api } from "~/utils/api";

export const ChannelVideos = (props: { channelHandle: string }) => {
  const [orderBy, setOrderBy] = useState<"createdAt" | "views">("createdAt");
  const { data: videosData, isLoading: videosLoading } =
    api.video.getByChannelHandle.useQuery({
      channelHandle: props.channelHandle,
      orderBy: orderBy,
    });

  if (videosLoading) return <div>Loading...</div>;

  if (!videosData) return <div>Something went wrong</div>;

  return (
    <>
      <div className="flex gap-3 px-[var(--content-padding-x)] py-4">
        <button
          onClick={() => setOrderBy("createdAt")}
          className={`${
            orderBy === "createdAt"
              ? "text-white bg-[#0f0f0f] hover:bg-[#030303] dark:bg-[#f1f1f1] dark:text-[#0f0f0f] dark:hover:bg-white"
              : "text-[#0f0f0f] bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/[.15]"
          } rounded-lg px-3 py-1.5 text-sm`}
        >
          Latest
        </button>
        <button
          onClick={() => setOrderBy("views")}
          className={`${
            orderBy === "views"
              ? "text-white bg-[#0f0f0f] hover:bg-[#030303] dark:bg-[#f1f1f1] dark:text-[#0f0f0f] dark:hover:bg-white"
              : "text-[#0f0f0f] bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/[.15]"
          } rounded-lg px-3 py-1.5 text-sm`}
        >
          Popular
        </button>
      </div>
      <div
        style={
          {
            "--max-card-width": "305px",
            "--min-card-width": "255px",
          } as CSSProperties
        }
        className="mx-auto grid h-min w-full max-w-[min(100%,var(--max-content-width))] grid-cols-[repeat(auto-fill,minmax(min(100%,var(--min-card-width)),max-content))] justify-center gap-[3rem_1rem] px-[var(--content-padding-x)]"
      >
        {videosData.map((video, index) => (
          <VideoCard hideChannel {...video} key={`video-card-${index}`} />
        ))}
      </div>
    </>
  );
};
