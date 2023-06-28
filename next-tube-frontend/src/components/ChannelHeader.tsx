import Image from "next/image";
import { api } from "~/utils/api";
import { useUser } from "@supabase/auth-helpers-react";
import { SubscribeBtn } from "./SubscribeBtn";
import Link from "next/link";
import { ChannelSettingsModal } from "./ChannelSettingsModal";
import { useAtom } from "jotai";
import { channelSettingsModalOpenAtom } from "~/utils/atoms";
import { ArrowRightIcon } from "~/icons/ArrowRight";
import { UnsubscribeBtn } from "./UnsubscribeBtn";

export const ChannelHeader = (props: { channelHandle: string }) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  });
  const user = useUser();
  const [channelSettingsModalOpen, setChannelSettingsModalOpen] = useAtom(
    channelSettingsModalOpenAtom
  );

  const { data: videosCount, isLoading: videosCountLoading } =
    api.video.getCountByChannel.useQuery({
      channelHandle: props.channelHandle,
    });
  const { data: channelData, isLoading: channelLoading } =
    api.channel.getByHandle.useQuery({
      channelHandle: props.channelHandle,
    });
  const { data: isUserSubbed, isLoading: subStatusLoading } =
    api.subscription.isUserSubbed.useQuery({
      channelHandle: props.channelHandle,
    });
  const { data: subsNum, isLoading: subsNumLoading } =
    api.subscription.getSubsByHandle.useQuery({
      channelHandle: props.channelHandle,
    });

  if (channelLoading || videosCountLoading) return <div>Loading...</div>;

  if (!channelData || videosCount === undefined)
    return <div>Something went wrong</div>;

  return (
    <>
      {channelData.hasBanner && (
        <div className="relative h-[calc(15.5vw)] w-full">
          <Image
            fill
            alt="channel's banner"
            src={`${
              process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
            }/storage/v1/object/public/pictures/${channelData.id}/banner`}
          />
        </div>
      )}
      <div className="mx-auto my-2 flex w-full max-w-[var(--max-content-width)] items-center px-[var(--content-padding-x)]">
        <div className="relative my-4 mr-6 hidden h-32 w-32 overflow-hidden rounded-full bg-red-600 min-[702px]:block">
          {channelData.hasLogo && (
            <Image
              fill
              alt="channel's logo"
              src={`${
                process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
              }/storage/v1/object/public/pictures/${channelData.id}/logo`}
            />
          )}
        </div>
        <div className="mt-3 flex grow flex-wrap justify-between gap-1">
          <div className="flex flex-col">
            <span className="mb-0.5 text-xl min-[702px]:text-2xl">
              {channelData.name}
            </span>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              <span className="font-medium">@{channelData.handle}</span>
              {!subsNumLoading && subsNum !== undefined && <span className="ml-2">
                {subsNum === 0 && "No subscribers"}
                {subsNum === 1 &&
                  formatter.format(subsNum) + " subscriber"}
                {subsNum > 1 &&
                  formatter.format(subsNum) + " subscribers"}
              </span>}
              <span className="ml-2">
                {videosCount === 0 && "No videos"}
                {videosCount === 1 && formatter.format(videosCount) + " video"}
                {videosCount > 1 && formatter.format(videosCount) + " videos"}
              </span>
            </p>
            <Link
              href={`/@${channelData.handle}/about`}
              className="my-2.5 flex max-w-[50vw] items-center overflow-hidden text-ellipsis whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary-dark min-[500px]:max-w-[330px] min-[957px]:max-w-[500px]"
            >
              {channelData.description ?? "More about this channel"}
              <ArrowRightIcon className="ml-1" />
            </Link>
          </div>
          {user && <div>
            {channelData.id !== user.id && !subStatusLoading && !isUserSubbed && <SubscribeBtn channelHandle={channelData.handle} />}
            {channelData.id !== user.id && !subStatusLoading && isUserSubbed && <UnsubscribeBtn channelHandle={channelData.handle} />}
            {channelData.id === user.id && (
              <button
                onClick={() => setChannelSettingsModalOpen(true)}
                className="mr-2 rounded-full bg-[#f1f1f1] px-4 py-2.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#d9d9d9] dark:bg-white/10 dark:text-[#f1f1f1] dark:hover:bg-white/20"
              >
                Settings
              </button>
            )}
            {channelData.id === user.id && (
              <Link
                href={"/studio"}
                className="rounded-full bg-[#f1f1f1] px-4 py-2.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#d9d9d9] dark:bg-white/10 dark:text-[#f1f1f1] dark:hover:bg-white/20"
              >
                Manage videos
              </Link>
            )}
          </div>}
        </div>
      </div>
      {channelData.id === user?.id && channelSettingsModalOpen && (
        <ChannelSettingsModal channel={channelData} />
      )}
    </>
  );
};
