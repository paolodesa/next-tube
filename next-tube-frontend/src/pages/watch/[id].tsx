import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { PageLayout } from "~/components/Layout";
import { VideoCardSm } from "~/components/VideoCardSm";
import { DislikeIcon } from "~/icons/Dislike";
import { KebabIcon } from "~/icons/Kebab";
import { LikeIcon } from "~/icons/Like";
import { SaveIcon } from "~/icons/Save";
import { ShareIcon } from "~/icons/Share";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { theaterModeAtom } from "~/utils/atoms";
import { useAtom } from "jotai";
import { VideoPlayer } from "~/components/VideoPlayer";
import Image from "next/image";
import { useUser } from "@supabase/auth-helpers-react";
import { SubscribeBtn } from "~/components/SubscribeBtn";
import { UnsubscribeBtn } from "~/components/UnsubscribeBtn";

dayjs.extend(relativeTime);

const VideoPage: NextPage<{ id: string; title: string }> = ({ id, title }) => {
  const { data: suggestedVideos, isLoading: videosLoading } =
    api.video.getAll.useQuery();
  const { data: video } = api.video.getById.useQuery({
    id,
  });
  const { data: isUserSubbed, isLoading: subStatusLoading } =
    api.subscription.isUserSubbed.useQuery({
      channelHandle: video?.channelHandle ?? "",
    });
  const { data: subsNum, isLoading: subsNumLoading } =
    api.subscription.getSubsByHandle.useQuery({
      channelHandle: video?.channelHandle ?? "",
    });
  const user = useUser();
  const [theater] = useAtom(theaterModeAtom);

  if (videosLoading) return <div>Loading...</div>;
  if (!suggestedVideos) return <div>Something went wrong</div>;
  if (!video) return <div>404</div>;

  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  });

  return (
    <>
      <Head>
        <title>{`${title} - NextTube`}</title>
      </Head>
      <PageLayout>
        <main
          className={`mx-auto justify-center gap-6 lg:flex ${
            theater ? "pt-0" : "max-w-[109.5rem] px-6 pt-6"
          }`}
          style={
            {
              "--max-player-height": "calc(100vh - 7rem - 3.5rem)",
            } as React.CSSProperties
          }
        >
          <div
            className={`flex w-full flex-col items-center ${
              theater
                ? "lg:min-w-[calc(480px*16/9)]"
                : "lg:min-w-[calc(360px*16/9)] lg:max-w-[calc(var(--max-player-height)*16/9)]"
            }`}
          >
            <VideoPlayer
              videoId={id}
              videoTitle={title}
              channelId={video.channelId}
              thumbnail={video.thumbnail}
            />
            <div
              className={`${
                theater ? "max-w-[109.5rem] px-6" : "max-w-[109.5rem]"
              } mt-3 w-full gap-6 lg:flex`}
            >
              <div className="w-full">
                <span className="line-clamp-2 text-xl font-medium">
                  {title}
                </span>
                <div className="mt-3 items-end md:flex">
                  <div className="flex h-10 items-end">
                    <Link
                      href={`/@${video.channelHandle}`}
                      className="relative h-10 w-10 overflow-hidden rounded-full bg-red-600"
                    >
                      {video.channelHasLogo && (
                        <Image
                          fill
                          alt="channel's logo"
                          src={`${
                            process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
                          }/storage/v1/object/public/pictures/${
                            video.channelId
                          }/logo`}
                        />
                      )}
                    </Link>
                    <div className="ml-2 flex flex-col">
                      <Link
                        href={`/@${video.channelHandle}`}
                        className="font-medium"
                      >
                        {video.channelName}
                      </Link>
                      {!subsNumLoading && subsNum !== undefined && <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        {subsNum === 0 && "No subscribers"}
                        {subsNum === 1 &&
                          formatter.format(subsNum) + " subscriber"}
                        {subsNum > 1 &&
                          formatter.format(subsNum) + " subscribers"}
                      </span>}
                    </div>
                    {user && user.id !== video.channelId && isUserSubbed !== undefined && !subStatusLoading && <div className="ml-6">
                      {!isUserSubbed && <SubscribeBtn channelHandle={video.channelHandle} />}
                      {isUserSubbed && <UnsubscribeBtn channelHandle={video.channelHandle} />}
                    </div>}
                  </div>
                  <div className="mt-4 h-9 md:ml-auto md:mt-0">
                    <div className="flex h-full items-center gap-2">
                      <div className="flex h-full items-center overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                        <button
                          className="flex items-center gap-1.5 rounded-l-full px-4 py-2 hover:bg-stone-200 dark:hover:bg-white/20"
                          title="I like this"
                        >
                          <LikeIcon />
                          <span className="text-sm font-medium">
                            {formatter.format(video.likes)}
                          </span>
                        </button>
                        <div className="h-4/5 border-l-[1px] border-stone-300 dark:border-stone-600"></div>
                        <button
                          className="rounded-r-full px-4 py-2 hover:bg-stone-200 dark:hover:bg-white/20"
                          title="I dislike this"
                        >
                          <DislikeIcon />
                        </button>
                      </div>
                      <button className="flex h-full items-center gap-1.5 rounded-full bg-stone-100 py-2 pl-3 pr-4 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20">
                        <ShareIcon />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                      <button className="hidden h-full items-center gap-1.5 rounded-full bg-stone-100 py-2 pl-3 pr-4 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 min-[440px]:max-[1023px]:flex min-[1200px]:flex">
                        <SaveIcon />
                        <span className="text-sm font-medium">Save</span>
                      </button>
                      <button className="flex h-full w-9 items-center justify-center rounded-full bg-stone-100 p-2 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20">
                        <div className="rotate-90">
                          <KebabIcon />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex w-full flex-col gap-1 rounded-xl bg-stone-100 p-3 text-sm dark:bg-white/10">
                  <div className="flex gap-2 font-medium">
                    <span className="font-medium">
                      {formatter.format(video.views)} views
                    </span>
                    <span className="font-medium">
                      {dayjs(video.createdAt).fromNow()}
                    </span>
                  </div>
                  <p>
                    {video.description
                      ? `${video.description}`
                      : "No description available."}
                  </p>
                </div>
              </div>
              {theater && (
                <div
                  className={`mt-6 flex w-full flex-col overflow-hidden pr-6 lg:mt-3 lg:max-w-[25rem]`}
                >
                  {suggestedVideos.map((suggVideo) => (
                    <VideoCardSm {...suggVideo} key={suggVideo.id} />
                  ))}
                </div>
              )}
            </div>
          </div>
          {!theater && (
            <div
              className={`mt-6 flex w-full flex-col overflow-hidden pr-6 lg:mt-0 lg:max-w-[25rem]`}
            >
              {suggestedVideos.map((suggVideo) => (
                <VideoCardSm {...suggVideo} key={suggVideo.id} />
              ))}
            </div>
          )}
        </main>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no slug");

  const { title } = await ssg.video.getById.fetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
      title,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default VideoPage;
