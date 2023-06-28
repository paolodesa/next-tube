import Link from "next/link";
import { HomeIcon } from "~/icons/Home";
import { ShortsIcon } from "~/icons/Shorts";
import { SubscriptionsIcon } from "~/icons/Subscriptions";

export const SideMenuBtnSm = (props: {
  selected: boolean;
  type: "HOME" | "SHORTS" | "SUBSCRIPTIONS";
}) => {
  let btnPath: string;
  switch (props.type) {
    case "HOME":
      btnPath = "/"
      break
    case "SHORTS":
      btnPath = "/"
      break
    case "SUBSCRIPTIONS":
      btnPath = "/feed/subscriptions"
      break
  }

  return (
    <Link
      href={btnPath}
      className={`flex h-[4.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl px-2.5 hover:bg-stone-100 dark:hover:bg-white/10`}
    >
      {props.type === "HOME" && <HomeIcon filled={props.selected} />}
      {props.type === "SHORTS" && <ShortsIcon filled={props.selected} />}
      {props.type === "SUBSCRIPTIONS" && (
        <SubscriptionsIcon filled={props.selected} />
      )}
      <span className={`text-center text-[0.6rem]`}>
        {props.type.charAt(0) + props.type.slice(1).toLowerCase()}
      </span>
    </Link>
  );
};