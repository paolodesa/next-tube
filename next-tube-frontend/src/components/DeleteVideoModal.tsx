import { useAtom } from "jotai";
import Image from "next/image";
import { deleteVideoModalOpenAtom } from "~/utils/atoms";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { durationFormatter } from "~/utils/durationFormatter";

export const DeleteVideoModal = (props: { videoId: string }) => {
  const { videoId } = props;
  const { data: videoData } = api.video.getById.useQuery({ id: videoId });
  const [, setDeleteVideoModalOpen] = useAtom(deleteVideoModalOpenAtom);
  const [thumbNumber, setThumbNumber] = useState(1);
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  const ctx = api.useContext();
  const { mutate: deleteVideo } = api.video.deleteDraft.useMutation({
    onSuccess: async () => {
      await ctx.video.getByCurrentUser.invalidate();
      setDeleteVideoModalOpen(false);
    },
  });

  useEffect(() => {
    switch (videoData?.thumbnail) {
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
  }, [videoData]);

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full bg-black/50`}
      ></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex w-[576px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-white pt-5 dark:bg-[#282828]">
        <span className=" overflow-hidden text-ellipsis whitespace-nowrap px-6 text-xl">
          {"Permanently delete this video?"}
        </span>

        {videoData && (
          <>
            <div className="mx-6 mt-6 grid grid-cols-[7.5rem_1fr] gap-4 p-5 dark:bg-[#161616]">
              <div className="shimmer relative h-[calc(7.5rem*9/16)] w-[7.5rem] overflow-hidden">
                {videoData.status !== "UPLOADING" && (
                  <Image
                    fill={true}
                    className="object-cover"
                    alt="thumbnail"
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${videoData.channelId}/${videoData.id}/thumb-${thumbNumber}.jpeg`}
                  />
                )}
                <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black bg-opacity-80 p-0.5 text-xs font-medium text-white">
                  <span>{durationFormatter(videoData.duration)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden text-xs">
                <span className="text-ellipsis whitespace-nowrap">
                  {videoData.title}
                </span>
                <span className="text-text-secondary dark:text-text-secondary-dark">
                  Uploaded{" "}
                  {videoData.createdAt.toLocaleDateString(undefined, {
                    dateStyle: "long",
                  })}
                </span>
                <span className="text-text-secondary dark:text-text-secondary-dark">
                  {formatter.format(videoData.views)} views
                </span>
              </div>
            </div>
            <div className="mt-4 flex h-[52px] w-full items-center justify-end gap-1 px-4">
              <button
                onClick={() => setDeleteVideoModalOpen(false)}
                form="video-form"
                className={`h-min rounded-sm px-2 py-1 text-sm font-medium dark:text-yt-blue-dark dark:disabled:bg-[#606060]`}
              >
                CANCEL
              </button>
              <button
                onClick={() => deleteVideo({ videoId })}
                form="video-form"
                className={`h-min rounded-sm px-2 py-2 text-sm font-medium dark:text-yt-blue-dark dark:disabled:bg-[#606060]`}
              >
                DELETE VIDEO
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
