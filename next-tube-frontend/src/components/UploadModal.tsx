import { useAtom } from "jotai";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { XIcon } from "~/icons/X";
import {
  editVideoIdAtom,
  editVideoModalOpenAtom,
  uploadModalOpenAtom,
} from "~/utils/atoms";
import { VideoDropzone } from "./VideoDropzone";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { api } from "~/utils/api";
import { Spinner } from "./Spinner";
import { useRouter } from "next/router";

export const UploadModal = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [videoFile, setVideoFile] = useState<File>();
  const [videoFilename, setVideoFilename] = useState<string>();
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string>();
  const [, setUploadModalOpen] = useAtom(uploadModalOpenAtom);
  const [, setEditVideoId] = useAtom(editVideoIdAtom);
  const [, setEditVideoModalOpen] = useAtom(editVideoModalOpenAtom);

  const { mutate: deleteDraft } = api.video.deleteDraft.useMutation();
  const { mutate: createDraft, isLoading: isCreatingDraft } =
    api.video.createDraft.useMutation({
      onSuccess: async ({ videoId, channelId }) => {
        if (videoFile && videoFilename) {
          setIsUploadingVideo(true);
          const videoExt = videoFilename.split(".").pop();
          if (videoExt) {
            const { error } = await supabaseClient.storage
              .from("raw-videos")
              .upload(`${channelId}/${videoId}/input.${videoExt}`, videoFile);
            setIsUploadingVideo(false);
            if (error) {
              deleteDraft({ videoId });
              setVideoUploadError(
                "An unexected error occurred, please try again."
              );
            } else {
              setUploadModalOpen(false);
              setEditVideoId(videoId);
              setEditVideoModalOpen(true);
            }
          } else {
            setIsUploadingVideo(false);
            deleteDraft({ videoId });
            setVideoUploadError("The video filename is missing its extension.");
          }
        }
      },
      onError: () => {
        setVideoUploadError("An unexected error occurred, please try again.");
      },
    });
  const videoDropzone = useDropzone({
    accept: {
      "video/*": [],
    },
    multiple: false,
    noClick: true,
    onDropAccepted: (files) => {
      if (files[0]) {
        const filename = files[0].name;
        const filenameClean = filename
          .replaceAll("_", " ")
          .replace(new RegExp(".(mp4|avi|mov|mkv)$"), "")
          .trim()
          .slice(0, 100);

        setVideoFilename(filename);
        setVideoFile(files[0]);
        createDraft({ title: filenameClean, filename: filename });
      }
    },
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]) {
        if (fileRejections[0].errors[0]?.code === "file-invalid-type") {
          setVideoUploadError("Invalid file format.");
        } else {
          setVideoUploadError(fileRejections[0].errors[0]?.message);
        }
      }
    },
  });

  return (
    <>
      <div className={`top-0 left-0 fixed z-50 h-full w-full bg-black/50`}></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100%-96px)] w-[calc(100%-96px)] max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-white dark:bg-[#282828]">
        <div className="flex h-16 w-full items-center justify-between pl-6 pr-4">
          <span className="mr-4 max-w-[675px] grow overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            Upload videos
          </span>
          <button
            onClick={() => {
              setUploadModalOpen(false);
              void router.push("/studio");
            }}
            title="Close"
            className="group h-10 w-10 p-2"
          >
            <XIcon />
          </button>
        </div>
        <div className="w-full border-t-[1px] border-stone-200 dark:border-stone-700"></div>

        <div className="h-[calc(100vh-96px-4rem-1px)] p-8">
          {isCreatingDraft || isUploadingVideo ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <Spinner className="h-[100px] w-[100px]" />
              <span className="text-lg font-medium">Uploading...</span>
            </div>
          ) : (
            <VideoDropzone
              dropzone={videoDropzone}
              errorMessage={videoUploadError}
            />
          )}
        </div>
      </div>
    </>
  );
};
