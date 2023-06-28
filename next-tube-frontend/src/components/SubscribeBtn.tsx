import { api } from "~/utils/api";

export const SubscribeBtn = (props: { channelHandle: string }) => {
  const ctx = api.useContext();
  const { mutate } = api.subscription.subscribeTo.useMutation({
    onSuccess: async () => {
      await ctx.subscription.isUserSubbed.invalidate({
        channelHandle: props.channelHandle,
      });
      await ctx.subscription.getSubsByHandle.invalidate({
        channelHandle: props.channelHandle,
      });
    }
  });

  return (
    <button
      onClick={() => {
        mutate({ channelHandle: props.channelHandle });
      }}
      className="h-9 w-24 rounded-full bg-black text-sm font-medium text-white dark:bg-[#f1f1f1] dark:text-[#0f0f0f] dark:hover:bg-[#d9d9d9]"
    >
      Subscribe
    </button>
  );
};
