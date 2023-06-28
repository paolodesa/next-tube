import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.video.findMany({
      take: 10,
      where: {
        status: "PUBLIC",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const video = await ctx.prisma.video.findUnique({
        where: {
          id: input.id,
        },
      });

      if (
        !video ||
        (video.channelId !== ctx.userId && video.status !== "PUBLIC")
      )
        throw new TRPCError({ code: "NOT_FOUND" });

      return video;
    }),

  getByCurrentUser: privateProcedure.query(async ({ ctx }) => {
    const videos = await ctx.prisma.video.findMany({
      where: {
        channelId: ctx.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!videos) throw new TRPCError({ code: "NOT_FOUND" });

    return videos;
  }),

  getByChannelHandle: publicProcedure
    .input(
      z.object({
        channelHandle: z.string(),
        orderBy: z.enum(["createdAt", "views"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.orderBy === "createdAt") {
        const video = await ctx.prisma.video.findMany({
          where: {
            channelHandle: input.channelHandle,
            status: "PUBLIC",
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        });

        if (!video) throw new TRPCError({ code: "NOT_FOUND" });

        return video;
      } else {
        const video = await ctx.prisma.video.findMany({
          where: {
            channelHandle: input.channelHandle,
            status: "PUBLIC",
          },
          take: 10,
          orderBy: { views: "desc" },
        });

        if (!video) throw new TRPCError({ code: "NOT_FOUND" });

        return video;
      }
    }),

  getCountByChannel: publicProcedure
    .input(z.object({ channelHandle: z.string() }))
    .query(async ({ ctx, input }) => {
      const videosCount = await ctx.prisma.video.count({
        where: {
          channelHandle: input.channelHandle,
          status: "PUBLIC",
        },
      });

      if (videosCount === undefined) throw new TRPCError({ code: "NOT_FOUND" });

      return videosCount;
    }),

  getBySubbedTo: privateProcedure.query(async ({ ctx }) => {
    const videos = await ctx.prisma.video.findMany({
      where: {
        channel: {
          subscriptions: {
            some: {
              subscriberId: ctx.userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!videos) throw new TRPCError({ code: "NOT_FOUND" });

    return videos;
  }),

  createDraft: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        filename: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channelId = ctx.userId;

      const video = await ctx.prisma.video.create({
        data: {
          channel: {
            connect: {
              id: channelId,
            },
          },
          title: input.title,
          filename: input.filename,
        },
      });

      return { videoId: video.id, channelId: video.channelId };
    }),

  edit: privateProcedure
    .input(
      z.object({
        videoId: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(5000).optional(),
        thumbnail: z.enum(["A", "B", "C", "CUSTOM"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channelId = ctx.userId;

      const video = await ctx.prisma.video.findUnique({
        where: {
          id: input.videoId,
        },
      });

      if (video?.channelId !== channelId || !video)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const updatedVideo = await ctx.prisma.video.update({
        where: {
          id: input.videoId,
        },
        data: {
          title: input.title,
          description: input.description ?? null,
          thumbnail: input.thumbnail,
        },
      });

      return updatedVideo;
    }),

  deleteDraft: privateProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channelId = ctx.userId;

      const video = await ctx.prisma.video.findUnique({
        where: {
          id: input.videoId,
        },
      });

      if (video?.channelId !== channelId || !video)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const deletedVideo = await ctx.prisma.video.delete({
        where: {
          id: input.videoId,
        },
      });

      return deletedVideo;
    }),
});
