import { useRouter } from "next/router";
import { ChannelTabsBtn } from "./ChannelTabsBtn";

export const ChannelTabsBar = (props: { channelHandle: string, noContent?: boolean }) => {
  const router = useRouter();
  const route = router.asPath;

  return (
    <div className="sticky top-14 z-20">
      <div className="px-[var(--content-padding-x)] w-full">
        <div className="mx-auto mt-0 flex w-full max-w-[var(--max-content-width)] overflow-x-scroll overflow-hidden bg-white dark:bg-[#0f0f0f]">
          <ChannelTabsBtn
            selected={
              route === `/@${props.channelHandle}` ||
              route === `/@${props.channelHandle}/featured`
            }
            href={`/@${props.channelHandle}/featured`}
          >
            HOME
          </ChannelTabsBtn>
          {!props.noContent && <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/videos`}
            href={`/@${props.channelHandle}/videos`}
          >
            VIDEOS
          </ChannelTabsBtn>}
          {/* <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/shorts`}
            href={`/@${props.channelHandle}/shorts`}
          >
            SHORTS
          </ChannelTabsBtn>
          <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/live`}
            href={`/@${props.channelHandle}/live`}
          >
            LIVE
          </ChannelTabsBtn> */}
          <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/playlists`}
            href={`/@${props.channelHandle}/playlists`}
          >
            PLAYLISTS
          </ChannelTabsBtn>
          {/* <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/community`}
            href={`/@${props.channelHandle}/community`}
          >
            COMMUNITY
          </ChannelTabsBtn> */}
          <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/channels`}
            href={`/@${props.channelHandle}/channels`}
          >
            CHANNELS
          </ChannelTabsBtn>
          <ChannelTabsBtn
            selected={route === `/@${props.channelHandle}/about`}
            href={`/@${props.channelHandle}/about`}
          >
            ABOUT
          </ChannelTabsBtn>
        </div>
      </div>
      <div className="-mt-[1px] w-full border-t-[1px] border-stone-200 dark:border-stone-700"></div>
    </div>
  );
};
