import { api } from "~/utils/api";

export const UnsubscribeBtn = (props: { channelHandle: string }) => {
  const ctx = api.useContext();
  const { mutate } = api.subscription.unsubscribeFrom.useMutation({
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
      className="h-9 w-28 rounded-full bg-[#f1f1f1] text-sm font-medium text-[#0f0f0f] hover:bg-[#d9d9d9] dark:bg-white/10 dark:text-[#f1f1f1] dark:hover:bg-white/20">
      Unsubscribe
    </button>
  );
};
