import { createTRPCRouter } from "~/server/api/trpc";
import { videoRouter } from "~/server/api/routers/video";
import { channelRouter } from "./routers/channel";
import { subscriptionRouter } from "./routers/subscription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
  channel: channelRouter,
  subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
