import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const channelRouter = createTRPCRouter({
  checkHandleAvail: publicProcedure
    .input(z.object({ channelHandle: z.string() }))
    .query(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: {
          handle: input.channelHandle,
        },
      });

      if (channel) {
        return false;
      } else {
        return true;
      }
    }),

  getByHandle: publicProcedure
    .input(z.object({ channelHandle: z.string() }))
    .query(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: {
          handle: input.channelHandle,
        },
      });

      if (!channel) throw new TRPCError({ code: "NOT_FOUND" });

      return channel;
    }),

  getByCurrentUser: privateProcedure.query(async ({ ctx }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: ctx.userId,
      },
    });

    if (!channel) throw new TRPCError({ code: "NOT_FOUND" });

    return channel;
  }),

  edit: privateProcedure
    .input(
      z.object({
        description: z.string().max(5000).optional(),
        hasLogo: z.boolean(),
        hasBanner: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: {
          id: ctx.userId,
        },
      });

      if (!channel) throw new TRPCError({ code: "NOT_FOUND" });

      const updatedChannel = await ctx.prisma.channel.update({
        where: {
          id: ctx.userId,
        },
        data: {
          description: input.description ?? null,
          hasLogo: input.hasLogo,
          hasBanner: input.hasBanner,
        },
      });

      return updatedChannel;
    }),
});
