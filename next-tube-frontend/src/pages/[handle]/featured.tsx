import type { GetStaticProps, NextPage } from "next";

import type { CSSProperties } from "react";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Head from "next/head";
import { ChannelHeader } from "~/components/ChannelHeader";
import { ChannelTabsBar } from "~/components/ChannelTabsBar";
import { ChannelFeatured } from "~/components/ChannelFeatured";
import { WithMenuLayout } from "~/components/WithMenuLayout";

const ChannelHomePage: NextPage<{ handle: string; channelName: string; videosCount: number }> = ({
  handle: channelHandle,
  channelName,
  videosCount,
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
              "--carousel-cards-raw": "calc((100% - 5rem) / 214px)",
              "--content-padding-x": "calc((100% - var(--carousel-cards) * 214px) / 2)",
              // "--content-padding-x": "2.5rem",
              "--max-content-width":
                "calc(1284px + (var(--content-padding-x) * 2))",
            } as CSSProperties
          }
        >
          <ChannelHeader channelHandle={channelHandle} />
          <ChannelTabsBar channelHandle={channelHandle} noContent={videosCount === 0} />
          <ChannelFeatured channelHandle={channelHandle} />
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

  const videosCount = await ssg.video.getCountByChannel.fetch({channelHandle: handle});

  return {
    props: {
      trpcState: ssg.dehydrate(),
      handle,
      channelName,
      videosCount,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ChannelHomePage;
