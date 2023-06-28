import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const subscriptionRouter = createTRPCRouter({
  getSubsByHandle: publicProcedure.input(z.object({channelHandle: z.string()})).query(async ({ctx, input}) => {
    const subsNumber = await ctx.prisma.subscription.count({
      where: {
        channelHandle: input.channelHandle
      }
    });

    return subsNumber;
  }),

  isUserSubbed: privateProcedure
    .input(z.object({ channelHandle: z.string() }))
    .query(async ({ ctx, input }) => {
      const sub = await ctx.prisma.subscription.findFirst({
        where: {
          channelHandle: input.channelHandle,
          AND: {
            subscriberId: ctx.userId,
          },
        },
      });

      if (sub) {
        return true;
      } else {
        return false;
      }
    }),

  subscribeTo: privateProcedure
    .input(z.object({ channelHandle: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await ctx.prisma.subscription.create({
        data: {
          channelHandle: input.channelHandle,
          subscriberId: ctx.userId,
        },
      });

      if (!sub) throw new TRPCError({ code: "BAD_REQUEST" });

      return sub;
    }),

  unsubscribeFrom: privateProcedure
    .input(z.object({ channelHandle: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.prisma.subscription.deleteMany({
        where: {
          channelHandle: input.channelHandle,
          AND: {
            subscriberId: ctx.userId,
          },
        },
      });

      if (!res) throw new TRPCError({ code: "BAD_REQUEST" });

      return res;
    }),
});
