import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, type KeyboardEvent, type FormEvent, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, useWatch } from "react-hook-form";
import { ThumbUploadIcon } from "~/icons/ThumbUpload";
import { XIcon } from "~/icons/X";
import { channelSettingsModalOpenAtom } from "~/utils/atoms";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { api } from "~/utils/api";
import type { Channel } from "@prisma/client";
import { Spinner } from "./Spinner";

type FormInputs = {
  description: string | null;
};

export const ChannelSettingsModal = (props: { channel: Channel }) => {
  const supabaseClient = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>();
  const [logoUploadError, setLogoUploadError] = useState<string>();
  const [logoFile, setLogoFile] = useState<File>();
  const [bannerUrl, setBannerUrl] = useState<string>();
  const [bannerUploadError, setBannerUploadError] = useState<string>();
  const [bannerFile, setBannerFile] = useState<File>();
  const [, setChannelSettingsModalOpen] = useAtom(channelSettingsModalOpenAtom);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({ mode: "all" });
  const description = useWatch({
    control,
    name: "description",
  });
  const ctx = api.useContext();
  const { mutate: editChannel } = api.channel.edit.useMutation({
    onSuccess: async () => {
      await ctx.channel.invalidate();
      setChannelSettingsModalOpen(false);
    },
  });
  const { getRootProps: getRootPropsLogo, getInputProps: getInputPropsLogo } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      multiple: false,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles[0]) {
          setLogoUrl(URL.createObjectURL(acceptedFiles[0]));
          setLogoUploadError(undefined);
          setLogoFile(acceptedFiles[0]);
        }
      },
      onDropRejected: (fileRejections) => {
        if (fileRejections[0]) {
          setLogoUploadError(fileRejections[0].errors[0]?.message);
          setTimeout(() => {
            setLogoUploadError(undefined);
          }, 5000);
        }
      },
    });
  const {
    getRootProps: getRootPropsBanner,
    getInputProps: getInputPropsBanner,
  } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setBannerUrl(URL.createObjectURL(acceptedFiles[0]));
        setBannerUploadError(undefined);
        setBannerFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]) {
        setBannerUploadError(fileRejections[0].errors[0]?.message);
        setTimeout(() => {
          setBannerUploadError(undefined);
        }, 5000);
      }
    },
  });

  useEffect(() => {
    register("description", { required: false, maxLength: 5000 });
  }, [register]);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);
  useEffect(() => {
    return () => {
      if (bannerUrl) URL.revokeObjectURL(bannerUrl);
    };
  }, [bannerUrl]);

  useEffect(() => {
    setValue("description", props.channel.description);
    if (props.channel.hasLogo && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLogoUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pictures/${props.channel.id}/logo`
      );
    }
    if (props.channel.hasBanner && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setBannerUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pictures/${props.channel.id}/banner`
      );
    }
  }, [
    props.channel.description,
    props.channel.hasLogo,
    props.channel.hasBanner,
    props.channel.id,
    setValue,
  ]);

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
    setLoading(true);
    if (logoFile) {
      const { error } = await supabaseClient.storage
        .from("pictures")
        .upload(`${props.channel.id}/logo`, logoFile, {
          upsert: true,
          contentType: logoFile.type,
        });
      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }
    } else if (!logoUrl) {
      await supabaseClient.storage.from("pictures").remove([`${props.channel.id}/logo`]);
    }
    if (bannerFile) {
      const { error } = await supabaseClient.storage
        .from("pictures")
        .upload(`${props.channel.id}/banner`, bannerFile, {
          upsert: true,
          contentType: bannerFile.type,
        });
      if (error) {
        setLoading(false);
        return;
      }
    } else if (!bannerUrl) {
      await supabaseClient.storage.from("pictures").remove([`${props.channel.id}/banner`]);
    }
    editChannel({
      description: data.description && data.description !== "" ? data.description : undefined,
      hasLogo: logoUrl ? true : false,
      hasBanner: bannerUrl ? true : false,
    });
    setLoading(false);
  });

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full bg-black/50`}
      ></div>
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100%-96px)] w-[calc(100%-96px)] max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-white dark:bg-[#282828]">
        <div className="flex h-16 w-full items-center justify-between pl-6 pr-4">
          <span className="mr-4 max-w-[675px] grow overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            {"Channel settings"}
          </span>
          <button
            onClick={() => {
              setChannelSettingsModalOpen(false);
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
            id="channel-form"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            className="flex w-full flex-col gap-4 pt-6"
          >
            <div
              className={`${
                errors.description
                  ? "border-[#ff4e45]"
                  : "border-stone-300 focus-within:border-yt-blue dark:border-stone-600 dark:focus-within:border-yt-blue-dark"
              } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
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
                defaultValue={props.channel.description ?? undefined}
                placeholder="Tell viewers about your channel"
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
            <span className="pt-3 text-sm font-medium">{"Channel logo"}</span>
            <div className="flex items-center gap-1">
              <div
                {...getRootPropsLogo()}
                {...(logoUrl && {
                  onClick: (e) => {
                    e.stopPropagation();
                    setLogoUrl(undefined);
                    setLogoFile(undefined);
                  },
                })}
                className={`h-[128px] w-[128px] rounded-full ${
                  logoUploadError ? "border-[#ff4e45]" : "border-stone-700"
                } relative flex cursor-pointer flex-col items-center justify-center gap-1 border-[1px] border-dashed`}
              >
                {logoUploadError && (
                  <div className="form-tooltip absolute -top-2 left-0 flex -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2">
                    <span className="text-xs font-normal">
                      {logoUploadError}
                    </span>
                  </div>
                )}
                {logoUrl && (
                  <div className="absolute h-full w-full overflow-hidden rounded-full hover:opacity-25">
                    <Image
                      fill
                      className="object-cover"
                      src={logoUrl}
                      alt="Logo preview"
                      onLoad={() => URL.revokeObjectURL(logoUrl)}
                    />
                  </div>
                )}
                <input {...getInputPropsLogo()} />
                {!logoUrl ? <ThumbUploadIcon
                  className={`${
                    logoUploadError
                      ? "fill-[#ff4e45]"
                      : "fill-text-secondary dark:fill-text-secondary-dark"
                  }`}
                /> : <XIcon />}
                <span
                  className={`${
                    logoUploadError
                      ? "text-[#ff4e45]"
                      : "text-text-secondary dark:text-text-secondary-dark"
                  } text-center text-[11px]`}
                >
                  {!logoUrl ? "Upload logo" : "Remove logo"}
                </span>
              </div>
            </div>
            <span className="pt-3 text-sm font-medium">{"Channel banner"}</span>
            <div className="flex items-center gap-1 pb-8">
              <div
                {...getRootPropsBanner()}
                {...(bannerUrl && {
                  onClick: (e) => {
                    e.stopPropagation();
                    setBannerUrl(undefined);
                    setBannerFile(undefined);
                  },
                })}
                className={`aspect-[100/15.5] w-full ${
                  bannerUploadError ? "border-[#ff4e45]" : "border-stone-700"
                } relative flex cursor-pointer flex-col items-center justify-center gap-1 border-[1px] border-dashed`}
              >
                {bannerUploadError && (
                  <div className="form-tooltip absolute -top-2 left-0 flex -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2">
                    <span className="text-xs font-normal">
                      {bannerUploadError}
                    </span>
                  </div>
                )}
                {bannerUrl && (
                  <div className="absolute h-full w-full hover:opacity-25">
                    <Image
                      fill
                      className="object-cover"
                      src={bannerUrl}
                      alt="Banner preview"
                      onLoad={() => URL.revokeObjectURL(bannerUrl)}
                    />
                  </div>
                )}
                <input {...getInputPropsBanner()} />
                {!bannerUrl ? <ThumbUploadIcon
                  className={`${
                    bannerUploadError
                      ? "fill-[#ff4e45]"
                      : "fill-text-secondary dark:fill-text-secondary-dark"
                  }`}
                /> : <XIcon />}
                <span
                  className={`${
                    bannerUploadError
                      ? "text-[#ff4e45]"
                      : "text-text-secondary dark:text-text-secondary-dark"
                  } text-center text-[11px]`}
                >
                  {!bannerUrl ? "Upload banner" : "Remove banner"}
                </span>
              </div>
            </div>
          </form>
        </div>
        <div className="w-full border-t-[1px] border-stone-200 dark:border-stone-700"></div>
        <div className="flex h-[52px] w-full items-center px-2">
          {!loading && (
            <button
              type="submit"
              form="channel-form"
              className={`ml-auto h-min rounded-sm bg-yt-blue px-3.5 py-2 text-sm text-white dark:bg-yt-blue-dark dark:font-semibold dark:text-[#0d0d0d]`}
            >
              DONE
            </button>
          )}
          {loading && <Spinner className="ml-auto mr-5 h-8 w-8" />}
        </div>
      </div>
    </>
  );
};
