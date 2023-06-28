import Head from "next/head";
import { PageLayout } from "~/components/Layout";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { VideoStatus, VideoThumbnail } from "@prisma/client";
import { durationFormatter } from "~/utils/durationFormatter";
import { EditIcon } from "~/icons/Edit";
import Link from "next/link";
import { YTOutlineIcon } from "~/icons/YTOutline";
import { DeleteIcon } from "~/icons/Delete";
import {
  deleteVideoIdAtom,
  deleteVideoModalOpenAtom,
  editVideoIdAtom,
  editVideoModalOpenAtom,
  uploadModalOpenAtom,
} from "~/utils/atoms";
import { useAtom } from "jotai";
import { VideoDetailsEditor } from "~/components/VideoDetailsEditor";
import { useRouter } from "next/router";
import { DeleteVideoModal } from "~/components/DeleteVideoModal";
import { UploadModal } from "~/components/UploadModal";
import type { GetServerSidePropsContext } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

dayjs.extend(relativeTime);

const VideoCardTable = (props: {
  id: string;
  thumbnail: VideoThumbnail;
  thumbnailsReady: boolean;
  title: string;
  description: string | null;
  duration: bigint;
  status: VideoStatus;
  channelId: string;
}) => {
  const [thumbNumber, setThumbNumber] = useState(1);
  const [, setEditVideoId] = useAtom(editVideoIdAtom);
  const [, setDeleteVideoId] = useAtom(deleteVideoIdAtom);
  const [, setEditVideoModalOpen] = useAtom(editVideoModalOpenAtom);
  const [, setDeleteVideoModalOpen] = useAtom(deleteVideoModalOpenAtom);
  const {
    id,
    thumbnail,
    thumbnailsReady,
    title,
    description,
    duration,
    status,
    channelId,
  } = props;

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

  const editVideo = (videoId: string) => {
    setEditVideoId(videoId);
    setEditVideoModalOpen(true);
  };

  const deleteVideo = (videoId: string) => {
    setDeleteVideoId(videoId);
    setDeleteVideoModalOpen(true);
  };

  return (
    <div className="grid w-full grid-cols-[8rem_1fr]">
      <div
        onClick={() => editVideo(id)}
        className="shimmer relative h-[calc(8rem*9/16)] cursor-pointer overflow-hidden"
      >
        {(thumbnailsReady || thumbNumber === 0) && (
          <Image
            fill={true}
            className="object-cover"
            alt="thumbnail"
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${channelId}/${id}/thumb-${thumbNumber}.jpeg`}
          />
        )}
        {status === "PUBLIC" && (
          <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black bg-opacity-80 p-0.5 text-xs font-medium text-white">
            <span>{durationFormatter(duration)}</span>
          </div>
        )}
      </div>
      <div className="relative mt-1 flex flex-col">
        <span
          onClick={() => editVideo(id)}
          className="mb-1 ml-4 line-clamp-1 cursor-pointer hover:underline"
        >
          {title}
        </span>
        <span className="ml-4 line-clamp-2 text-text-secondary group-hover:hidden dark:text-text-secondary-dark">
          {description ? description : "Add description"}
        </span>
        <div className="absolute bottom-0 ml-2 hidden gap-2 group-hover:flex">
          <button
            onClick={() => editVideo(id)}
            title="Details"
            className="h-10"
          >
            <EditIcon className="h-10 fill-text-secondary p-2 hover:fill-black dark:fill-text-secondary-dark dark:hover:fill-white" />
          </button>
          {status === "PUBLIC" && (
            <Link
              title="View on NextTube"
              className="h-10"
              href={`/watch/${id}`}
            >
              <YTOutlineIcon className="h-10 fill-text-secondary p-2 hover:fill-black dark:fill-text-secondary-dark dark:hover:fill-white" />
            </Link>
          )}
          {status === "PUBLIC" && (
            <button
              onClick={() => deleteVideo(id)}
              title="Delete"
              className="h-10"
            >
              <DeleteIcon className="h-10 fill-text-secondary p-2 hover:fill-black dark:fill-text-secondary-dark dark:hover:fill-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StudioPage = () => {
  const [editVideoId] = useAtom(editVideoIdAtom);
  const [deleteVideoId] = useAtom(deleteVideoIdAtom);
  const [editVideoModalOpen, setEditVideoModalOpen] = useAtom(editVideoModalOpenAtom);
  const [deleteVideoModalOpen, setDeleteVideoModalOpen] = useAtom(deleteVideoModalOpenAtom);
  const [uploadModalOpen, setUploadModalOpen] = useAtom(uploadModalOpenAtom);
  const { data: videos, isLoading: videosLoading } =
    api.video.getByCurrentUser.useQuery();
  const router = useRouter();

  useEffect(() => {
    const splitRoute = router.asPath.split("#");
    if (splitRoute.pop() === "upload") {
      setEditVideoModalOpen(false);
      setDeleteVideoModalOpen(false);
      setUploadModalOpen(true);
    }
  }, [router, setUploadModalOpen, setEditVideoModalOpen, setDeleteVideoModalOpen]);

  if (videosLoading) return <div>Loading...</div>;
  if (!videos) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>{`Studio - NextTube`}</title>
      </Head>
      <PageLayout>
        <main className={`px-6 pt-6`}>
          <span className="text-2xl font-medium dark:text-white">
            Channel content
          </span>
          <table className="mt-6 w-full dark:text-white">
            <thead className="border-[1px] border-stone-600 text-xs dark:text-text-secondary-dark">
              <tr>
                <th className="border-r-[1px] border-stone-600 px-6 py-3 text-left font-medium">
                  Video
                </th>
                <th className="py-3 pl-6 pr-2 text-left font-medium">
                  Visibility
                </th>
                <th className="px-3 py-3 text-left font-medium">Date</th>
                <th className="px-3 py-3 text-left font-medium">Views</th>
                <th className="px-3 py-3 text-left font-medium">Likes</th>
                <th className="py-3 pl-2 pr-6 text-left font-medium">
                  Dislikes
                </th>
              </tr>
            </thead>
            <tbody className="dark:text-text-white text-xs">
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="group border-[1px] border-stone-600 dark:hover:bg-stone-800"
                >
                  <td className="max-w-[20rem] border-r-[1px] border-stone-600 px-6 py-3">
                    <VideoCardTable
                      id={video.id}
                      thumbnail={video.thumbnail}
                      thumbnailsReady={video.thumbnailsReady}
                      title={video.title}
                      description={video.description}
                      duration={video.duration}
                      status={video.status}
                      channelId={video.channelId}
                    />
                  </td>
                  <td className="max-w-[6rem] py-4 pl-6 pr-2 align-top">
                    {video.status
                      .at(0)
                      ?.concat(video.status.slice(1).toLowerCase())}
                  </td>
                  <td className="max-w-[6rem] px-3 py-4 align-top">
                    {video.createdAt.toLocaleDateString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="max-w-[6rem] px-3 py-4 align-top">
                    {video.views.toLocaleString()}
                  </td>
                  <td className="max-w-[6rem] px-3 py-4 align-top">
                    {video.likes.toLocaleString()}
                  </td>
                  <td className="max-w-[6rem] py-4 pl-2 pr-6 align-top">
                    {video.dislikes.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </PageLayout>
      {editVideoId !== "" && editVideoModalOpen && (
        <VideoDetailsEditor videoId={editVideoId} />
      )}
      {deleteVideoId !== "" && deleteVideoModalOpen && (
        <DeleteVideoModal videoId={deleteVideoId} />
      )}
      {uploadModalOpen && <UploadModal />}
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(ctx.query);

  if (!session)
    return {
      redirect: {
        destination: "/login?redirectTo=studio",
        permanent: false,
      },
    };

  return { props: {} };
};

export default StudioPage;
