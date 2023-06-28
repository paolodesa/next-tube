import { type NextPage } from "next";

import { api } from "~/utils/api";

import { VideoCard } from "~/components/VideoCard";
import type { CSSProperties } from "react";
import { WithMenuLayout } from "~/components/WithMenuLayout";

const SubscriptionsPage: NextPage = () => {
  const { data, isLoading: videosLoading } = api.video.getBySubbedTo.useQuery();

  if (videosLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <WithMenuLayout>
      <div
        style={
          {
            "--max-card-width": "360px",
            "--min-card-width": "320px",
          } as CSSProperties
        }
        className="mx-auto mt-16 grid h-min w-full max-w-[min(100%,calc(2240px+3rem))] grid-cols-[repeat(auto-fill,minmax(min(100%,var(--min-card-width)),max-content))] justify-center gap-[3rem_1rem] px-6"
      >
        {data.map((video, index) => (
          <VideoCard {...video} key={`video-card-${index}`} />
        ))}
      </div>
    </WithMenuLayout>
  );
};

export default SubscriptionsPage;
