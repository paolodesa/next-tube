import type { GetStaticProps, NextPage } from "next";

import type { CSSProperties } from "react";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Head from "next/head";
import { ChannelHeader } from "~/components/ChannelHeader";
import { ChannelTabsBar } from "~/components/ChannelTabsBar";
import { ChannelVideos } from "~/components/ChannelVideos";
import { WithMenuLayout } from "~/components/WithMenuLayout";

const ChannelVideosPage: NextPage<{ handle: string; channelName: string }> = ({
  handle: channelHandle,
  channelName,
}) => {
  return (
    <>
      <Head>
        <title>{`${channelName} - NextTube`}</title>
      </Head>
      <WithMenuLayout>
        <div
          id="channel-content"
          className="w-full"
          style={
            {
              // "--content-padding-x": "2.5rem",
              "--content-padding-x": "calc((100% - var(--carousel-cards) * 214px) / 2)",
              "--max-content-width":
                "calc(1284px + (var(--content-padding-x) * 2))",
            } as CSSProperties
          }
        >
          <ChannelHeader channelHandle={channelHandle} />
          <ChannelTabsBar channelHandle={channelHandle} />
          <ChannelVideos channelHandle={channelHandle} />
        </div>
      </WithMenuLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const handle = context.params?.handle?.slice(1);

  if (typeof handle !== "string") throw new Error("no slug");

  const { name: channelName } = await ssg.channel.getByHandle.fetch({
    channelHandle: handle,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      handle,
      channelName,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ChannelVideosPage;
