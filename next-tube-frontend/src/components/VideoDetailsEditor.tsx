import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, type KeyboardEvent, type FormEvent, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, useWatch } from "react-hook-form";
import { ThumbUploadIcon } from "~/icons/ThumbUpload";
import { XIcon } from "~/icons/X";
import { editVideoModalOpenAtom } from "~/utils/atoms";
import { VideoPlayer } from "./VideoPlayer";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { api } from "~/utils/api";
import type { VideoThumbnail } from "@prisma/client";
import { useRouter } from "next/router";
import { Spinner } from "./Spinner";
import Link from "next/link";

type FormInputs = {
  title: string | null;
  description: string | null;
};

export const VideoDetailsEditor = (props: { videoId: string }) => {
  const { videoId } = props;
  const router = useRouter();
  const { data: videoData } = api.video.getById.useQuery({ id: videoId });
  const supabaseClient = useSupabaseClient();
  const [thumbUrl, setThumbUrl] = useState<string>();
  const [thumbUploadError, setThumbUploadError] = useState<string>();
  const [selectedThumb, setSelectedThumb] = useState<VideoThumbnail>();
  const [thumbFile, setThumbFile] = useState<File>();
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [, setEditVideoModalOpen] = useAtom(editVideoModalOpenAtom);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormInputs>({ mode: "all" });
  const title = useWatch({
    control,
    name: "title",
  });
  const description = useWatch({
    control,
    name: "description",
  });
  const ctx = api.useContext();
  const user = useUser();
  const { mutate: editVideo } = api.video.edit.useMutation({
    onSuccess: async () => {
      await ctx.video.getById.invalidate({ id: videoId });
      await ctx.video.getByCurrentUser.invalidate();
      setEditVideoModalOpen(false);
      await router.push("/studio");
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setThumbUrl(URL.createObjectURL(acceptedFiles[0]));
        setSelectedThumb("CUSTOM");
        setThumbUploadError(undefined);
        setThumbFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]) {
        setThumbUploadError(fileRejections[0].errors[0]?.message);
        setTimeout(() => {
          setThumbUploadError(undefined);
        }, 5000);
      }
    },
  });

  useEffect(() => {
    register("title", { required: true, minLength: 1, maxLength: 100 });
    register("description", { required: false, maxLength: 5000 });
  }, [register]);

  useEffect(() => {
    return () => {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  }, [thumbUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      void invalidateData();
    }, 2500);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    if (videoData && !firstLoadDone) {
      setFirstLoadDone(true);
      setValue("title", videoData.title);
      setValue("description", videoData.description);
      setSelectedThumb(videoData.thumbnail);
      if (videoData.thumbnail === "CUSTOM") {
        setThumbUrl(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${videoData.channelId}/${videoData.id}/thumb-0.jpeg`
        );
      }
    }
  }, [videoData, setValue, firstLoadDone, setFirstLoadDone]);

  const invalidateData = async () => {
    await ctx.video.getById.invalidate({ id: videoId });
    await ctx.video.getByCurrentUser.invalidate();
  };

  const handleTitleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleTitleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = "0";
    e.currentTarget.style.height =
      e.currentTarget.scrollHeight.toString() + "px";
  };

  const handleDescriptionKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.currentTarget.value) {
      e.preventDefault();
    }
  };

  const handleDescriptionInput = (e: FormEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = "0";
    e.currentTarget.style.height =
      e.currentTarget.scrollHeight.toString() + "px";
  };

  const onSubmit = handleSubmit(async (data) => {
    if (data.title && user) {
      if (selectedThumb === "CUSTOM" && thumbFile) {
        const { error } = await supabaseClient.storage
          .from("videos")
          .upload(`${user.id}/${videoId}/thumb-0.jpeg`, thumbFile, {
            upsert: true,
            contentType: thumbFile.type,
          });
        if (error) {
          return;
        }
      } else if (selectedThumb !== "CUSTOM") {
        await supabaseClient.storage.from("videos").remove([`${user.id}/${videoId}/thumb-0.jpeg`]);
      }
      editVideo({
        videoId: videoId,
        title: data.title,
        description: data.description && data.description !== "" ? data.description : undefined,
        thumbnail: selectedThumb ?? "A",
      });
    }
  });

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full bg-black/50`}
      ></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100%-96px)] w-[calc(100%-96px)] max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-white dark:bg-[#282828]">
        <div className="flex h-16 w-full items-center justify-between pl-6 pr-4">
          <span className="mr-4 max-w-[675px] grow overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            {title ?? "Upload videos"}
          </span>
          <button
            onClick={() => {
              setEditVideoModalOpen(false);
              void router.push("/studio");
            }}
            title="Close"
            className="group h-10 w-10 p-2"
          >
            <XIcon />
          </button>
        </div>
        <div className="w-full border-t-[1px] border-stone-200 dark:border-stone-700"></div>

        <div className="oveflow-hidden flex grow justify-between gap-6 overflow-y-auto px-12">
          <form
            id="video-form"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            className="flex flex-col gap-4 pt-6"
          >
            <span className="text-2xl">Details</span>
            <div
              className={`${
                errors.title
                  ? "border-[#ff4e45]"
                  : "border-stone-300 focus-within:border-yt-blue dark:border-stone-600 dark:focus-within:border-yt-blue-dark"
              } group relative flex h-min w-full max-w-[536px] flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
            >
              {errors.title && (
                <div className="form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 text-white group-focus-within:flex dark:text-black">
                  <span className="text-xs font-normal">
                    {errors.title.type === "required"
                      ? "Your video needs a title"
                      : "Your title is too long"}
                  </span>
                </div>
              )}
              <span
                className={`${
                  errors.title
                    ? "text-[#ff4e45]"
                    : "text-text-secondary group-focus-within:text-yt-blue dark:text-text-secondary-dark dark:group-focus-within:text-yt-blue-dark"
                } text-xs `}
              >
                {"Title (required)"}
              </span>
              <textarea
                {...register("title")}
                defaultValue={videoData?.title}
                placeholder="Add a title that describes your video"
                onKeyDown={handleTitleKeydown}
                onInput={handleTitleInput}
                className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
              ></textarea>
              <span
                className={`${
                  errors.title
                    ? "text-[#ff4e45]"
                    : "invisible text-text-secondary group-focus-within:visible dark:text-text-secondary-dark"
                } ml-auto text-xs`}
              >
                {title?.length ?? "0"}/100
              </span>
            </div>
            <div
              className={`${
                errors.description
                  ? "border-[#ff4e45]"
                  : "border-stone-300 focus-within:border-yt-blue dark:border-stone-600 dark:focus-within:border-yt-blue-dark"
              } group relative flex h-min w-full max-w-[536px] flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
            >
              {errors.description && (
                <div className="form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 text-white group-focus-within:flex dark:text-black">
                  <span className="text-xs font-normal">
                    Your description is too long
                  </span>
                </div>
              )}
              <span
                className={`${
                  errors.description
                    ? "text-[#ff4e45]"
                    : "text-text-secondary group-focus-within:text-yt-blue dark:text-text-secondary-dark dark:group-focus-within:text-yt-blue-dark"
                } text-xs `}
              >
                {"Description"}
              </span>
              <textarea
                {...register("description")}
                defaultValue={videoData?.description ?? ""}
                placeholder="Tell viewers about your video"
                onKeyDown={handleDescriptionKeydown}
                onInput={handleDescriptionInput}
                className={`my-1 max-h-[961px] min-h-[105px] resize-none overflow-hidden overflow-y-auto bg-transparent text-[15px] outline-none  placeholder:font-normal placeholder:text-[#717171]`}
              ></textarea>
              <span
                className={`${
                  errors.description
                    ? "text-[#ff4e45]"
                    : "invisible text-text-secondary group-focus-within:visible dark:text-text-secondary-dark"
                } ml-auto text-xs`}
              >
                {description?.length ?? "0"}/5000
              </span>
            </div>
            <span className="pt-3 text-sm font-medium">Thumbnail</span>
            <span className="max-w-[536px] text-xs text-text-secondary dark:text-text-secondary-dark">
              Select or upload a picture that shows what&apos;s in your video. A
              good thumbnail stands out and draws viewers&apos; attention.
            </span>
            <div className="flex items-center gap-1 pb-8">
              <div
                {...getRootProps()}
                {...(thumbUrl && {
                  onClick: (e) => {
                    e.stopPropagation();
                    setThumbUrl(undefined);
                    setThumbFile(undefined);
                    setSelectedThumb("A");
                  },
                })}
                className={`${
                  selectedThumb === "CUSTOM"
                    ? "h-[74px] w-[131px] border-2 border-[#282828] dark:border-white"
                    : `h-[70px] w-[127px] ${
                        thumbUploadError
                          ? "border-[#ff4e45]"
                          : "border-stone-700"
                      } ${
                        thumbUrl
                          ? "opacity-50 hover:opacity-100"
                          : "border-[1px] border-dashed"
                      }`
                } relative flex cursor-pointer flex-col items-center justify-center gap-1`}
              >
                {thumbUploadError && (
                  <div className="form-tooltip absolute -top-2 left-0 flex -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2">
                    <span className="text-xs font-normal">
                      {thumbUploadError}
                    </span>
                  </div>
                )}
                {thumbUrl && (
                  <div className="absolute h-full w-full hover:opacity-25">
                    <Image
                      fill
                      className="object-cover"
                      src={thumbUrl}
                      alt="Thumbnail preview"
                      onLoad={() => URL.revokeObjectURL(thumbUrl)}
                    />
                  </div>
                )}
                <input {...getInputProps()} />
                {!thumbUrl ? <ThumbUploadIcon
                  className={`${
                    thumbUploadError
                      ? "fill-[#ff4e45]"
                      : "fill-text-secondary dark:fill-text-secondary-dark"
                  }`}
                /> : <XIcon />}
                <span
                  className={`${
                    thumbUploadError
                      ? "text-[#ff4e45]"
                      : "text-text-secondary dark:text-text-secondary-dark"
                  } text-center text-[11px]`}
                >
                  {!thumbUrl ? "Upload thumbnail" : "Remove thumbnail"}
                </span>
                {selectedThumb !== "CUSTOM" && thumbUrl && (
                  <button
                    type="button"
                    className="absolute h-full w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedThumb("CUSTOM");
                    }}
                  ></button>
                )}
              </div>
              <button
                type="button"
                disabled={!videoData?.thumbnailsReady}
                onClick={() => {
                  setSelectedThumb("A");
                }}
                className={`${
                  selectedThumb === "A" && videoData?.thumbnailsReady
                    ? "h-[74px] w-[131px] border-2 border-[#282828] dark:border-white"
                    : "h-[70px] w-[127px] opacity-50 hover:opacity-100"
                }  shimmer relative`}
              >
                {videoData?.thumbnailsReady && (
                  <Image
                    alt=""
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${videoData.channelId}/${videoId}/thumb-1.jpeg`}
                    fill
                  />
                )}
              </button>
              <button
                type="button"
                disabled={!videoData?.thumbnailsReady}
                onClick={() => {
                  setSelectedThumb("B");
                }}
                className={`${
                  selectedThumb === "B" && videoData?.thumbnailsReady
                    ? "h-[74px] w-[131px] border-2 border-[#282828] dark:border-white"
                    : "h-[70px] w-[127px] opacity-50 hover:opacity-100"
                }  shimmer relative mx-0.5`}
              >
                {videoData?.thumbnailsReady && (
                  <Image
                    alt=""
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${videoData.channelId}/${videoId}/thumb-2.jpeg`}
                    fill
                  />
                )}
              </button>
              <button
                type="button"
                disabled={!videoData?.thumbnailsReady}
                onClick={() => {
                  setSelectedThumb("C");
                }}
                className={`${
                  selectedThumb === "C" && videoData?.thumbnailsReady
                    ? "h-[74px] w-[131px] border-2 border-[#282828] dark:border-white"
                    : "h-[70px] w-[127px] opacity-50 hover:opacity-100"
                }  shimmer relative`}
              >
                {videoData?.thumbnailsReady && (
                  <Image
                    alt=""
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/videos/${videoData.channelId}/${videoId}/thumb-3.jpeg`}
                    fill
                  />
                )}
              </button>
            </div>
          </form>
          <div className="sticky top-6 mt-[4.5rem] h-min w-full overflow-hidden bg-[#f9f9f9] dark:bg-[#1f1f1f]">
            {videoData?.status === "PUBLIC" ? (
              <VideoPlayer videoId={videoId} videoTitle="" channelId={videoData.channelId} smallPlayer />
            ) : (
              <div className="flex aspect-video w-full grow items-center justify-center bg-black">
                <Spinner className="h-12 w-12" />
              </div>
            )}
            {videoData?.status === "PUBLIC" && <div className="flex flex-col gap-0.5 px-4 pt-4 pb-1">
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                Video link
              </span>
              <Link href={`/watch/${videoId}`} className="text-yt-blue dark:text-yt-blue-dark overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-light">
                {`${window.location.origin}/watch/${videoId}`}
              </Link>
            </div>}
            <div className="flex flex-col gap-0.5 p-4">
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                Filename
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-light">
                {videoData?.filename}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full border-t-[1px] border-stone-200 dark:border-stone-700"></div>
        <div className="flex h-[52px] w-full items-center px-2">
          {videoData && videoData?.status === "PROCESSING" && (
            <span className="ml-4 text-xs text-text-secondary dark:text-text-secondary-dark">
              {`Processing... ${videoData.processingProgress}%`}
            </span>
          )}
          {videoData?.status === "PUBLIC" && (
            <span className="ml-4 text-xs text-text-secondary dark:text-text-secondary-dark">
              {`Processing complete`}
            </span>
          )}
          <button
            disabled={!isValid}
            type="submit"
            form="video-form"
            className={`ml-auto h-min rounded-sm bg-yt-blue px-3.5 py-2 text-sm text-white dark:bg-yt-blue-dark dark:font-semibold dark:text-[#0d0d0d] disabled:bg-[#ccc] dark:disabled:bg-[#606060]`}
          >
            DONE
          </button>
        </div>
      </div>
    </>
  );
};
